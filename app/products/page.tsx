"use client";

import AppNavbar from "@/components/AppNavbar";
import LoadingScreen from "@/components/LoadingScreen";
import ProductImage from "@/components/ProductImage";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  material: string;
  size: string;
  image?: string | null;
};

type CartItem = Product & { quantity: number };

const CART_KEY = "banbuk-cart";
const COMPARE_KEY = "compare-products";
const MAX_COMPARE_ITEMS = 2;

function normalizeCompareIds(ids: string[]) {
  return Array.from(new Set(ids.filter((id) => id.length > 0))).slice(0, MAX_COMPARE_ITEMS);
}

function readCompareIds() {
  try {
    const storedCompare = localStorage.getItem(COMPARE_KEY);
    const parsed: unknown = storedCompare ? JSON.parse(storedCompare) : [];
    return Array.isArray(parsed) ? normalizeCompareIds(parsed.filter((id): id is string => typeof id === "string")) : [];
  } catch {
    return [];
  }
}

function writeCompareIds(ids: string[]) {
  localStorage.setItem(COMPARE_KEY, JSON.stringify(normalizeCompareIds(ids)));
}

function addCartItem(product: Product) {
  const current = JSON.parse(localStorage.getItem(CART_KEY) || "[]") as CartItem[];
  const existing = current.find((item) => item.id === product.id);
  const next = existing
    ? current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
    : [...current, { ...product, quantity: 1 }];
  localStorage.setItem(CART_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("banbuk-cart-updated"));
  window.dispatchEvent(new Event("banbuk-cart-open"));
}

const formatPrice = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

export default function ProductsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [material, setMaterial] = useState("all");
  const [sort, setSort] = useState("featured");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [wishlistBusyId, setWishlistBusyId] = useState<string | null>(null);

  useEffect(() => {
    setCompareIds(readCompareIds());

    const load = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        const productList = Array.isArray(data) ? data : [];
        setProducts(productList);
        setCompareIds((currentIds) => {
          const validIds = currentIds.filter((id) => productList.some((product) => product.id === id));
          if (validIds.length !== currentIds.length) writeCompareIds(validIds);
          return validIds;
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      setWishlistIds([]);
      return;
    }

    const loadWishlist = async () => {
      try {
        const res = await fetch("/api/wishlist");
        if (!res.ok) return;
        const data = await res.json();
        setWishlistIds(
          Array.isArray(data)
            ? data
                .map((item) => item.productId ?? item.product?.id)
                .filter((id): id is string => typeof id === "string")
            : []
        );
      } catch {
        setWishlistIds([]);
      }
    };

    loadWishlist();
  }, [session?.user?.id]);

  const materials = useMemo(
    () => Array.from(new Set(products.map((product) => product.material).filter(Boolean))),
    [products]
  );

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesQuery = [product.name, product.description, product.material, product.size]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
      const matchesMaterial = material === "all" || product.material === material;
      return matchesQuery && matchesMaterial;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "stock") return b.stock - a.stock;
      return products.findIndex((product) => product.id === a.id) - products.findIndex((product) => product.id === b.id);
    });
  }, [material, products, query, sort]);

  const handleAddCart = (product: Product) => {
    addCartItem(product);
    showNotice(`${product.name} masuk ke cart.`);
  };

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const commitCompareIds = (next: string[], message: string) => {
    setCompareIds(next);
    writeCompareIds(next);
    showNotice(message);
  };

  const handleToggleCompare = (product: Product) => {
    const currentIds = readCompareIds();
    const selected = currentIds.includes(product.id);

    if (selected) {
      const next = currentIds.filter((id) => id !== product.id);
      commitCompareIds(next, `${product.name} dihapus dari perbandingan.`);
      return;
    }

    if (currentIds.length >= MAX_COMPARE_ITEMS) {
      showNotice("Maksimal dua produk. Buka halaman bandingkan untuk mengganti pilihan.");
      return;
    }

    const next = [...currentIds, product.id];
    commitCompareIds(next, `${product.name} siap dibandingkan.`);
  };

  const handleToggleWishlist = async (product: Product) => {
    if (!session) {
      showNotice("Masuk dulu untuk menyimpan wishlist.");
      window.setTimeout(() => router.push("/login"), 700);
      return;
    }

    const selected = wishlistIds.includes(product.id);
    setWishlistBusyId(product.id);

    try {
      const res = await fetch(selected ? `/api/wishlist?productId=${product.id}` : "/api/wishlist", {
        method: selected ? "DELETE" : "POST",
        headers: selected ? undefined : { "Content-Type": "application/json" },
        body: selected ? undefined : JSON.stringify({ productId: product.id }),
      });

      if (!res.ok) throw new Error("Wishlist request failed");

      setWishlistIds((currentIds) =>
        selected
          ? currentIds.filter((id) => id !== product.id)
          : currentIds.includes(product.id)
            ? currentIds
            : [...currentIds, product.id]
      );
      showNotice(selected ? `${product.name} dihapus dari wishlist.` : `${product.name} masuk wishlist.`);
    } catch {
      showNotice("Wishlist gagal diperbarui. Coba lagi sebentar.");
    } finally {
      setWishlistBusyId(null);
    }
  };

  if (loading) {
    return <LoadingScreen label="Memuat katalog" detail="Produk sedang disiapkan." />;
  }

  return (
    <main className="product-page min-h-screen text-white">
      <AppNavbar />

      {notice && (
        <div className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-[rgba(0,212,164,0.3)] bg-[color:var(--brand-green)] px-5 py-3 text-sm font-medium text-black shadow-[0_8px_24px_rgba(0,212,164,0.18)]">
          {notice}
        </div>
      )}

      <section className="content-wrap pb-6 pt-8">
        <div className="product-toolbar grid gap-3 p-3 md:grid-cols-[minmax(0,1fr)_200px_170px_150px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="product-input"
            placeholder="Cari produk, bahan, atau ukuran"
          />
          <select value={material} onChange={(event) => setMaterial(event.target.value)} className="product-input">
            <option value="all">Semua bahan</option>
            {materials.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="product-input">
            <option value="featured">Urutan katalog</option>
            <option value="price-low">Harga rendah</option>
            <option value="price-high">Harga tinggi</option>
            <option value="stock">Stok terbanyak</option>
          </select>
          <Link href="/products/compare" className="product-action product-action-primary min-h-[42px] w-full">
            Bandingkan {compareIds.length}/{MAX_COMPARE_ITEMS}
          </Link>
        </div>
      </section>

      <section className="content-wrap pb-20">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="section-kicker">Katalog</p>
            <h1 className="mt-2 text-[32px] font-semibold leading-tight md:text-[40px]">Produk tersedia</h1>
          </div>
          <p className="text-[14px] text-white/48">{visibleProducts.length} dari {products.length} produk</p>
        </div>

        {visibleProducts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {visibleProducts.map((product, index) => (
              <article key={product.id} className="product-card grid min-h-[340px] grid-rows-[150px_1fr] overflow-hidden">
                <Link href={`/products/${product.id}`} className="product-media relative">
                  <span className="absolute left-3 top-3 z-10 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-white/70">
                    {product.stock <= 5 ? "Stok terbatas" : index < 3 ? "Unggulan" : "Ready"}
                  </span>
                  <ProductImage
                    src={product.image}
                    alt={product.name}
                    variant={index % 3 === 2 ? "box" : "jar"}
                    className="max-h-[118px]"
                  />
                </Link>
                <div className="flex flex-col p-4">
                  <div className="flex items-start justify-between gap-4">
                    <Link href={`/products/${product.id}`}>
                      <h2 className="text-[18px] font-semibold leading-snug">{product.name}</h2>
                    </Link>
                    <span className="rounded-md bg-white/[0.06] px-2 py-1 text-[11px] text-white/58">{product.stock}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 min-h-[40px] text-[13px] leading-5 text-white/58">{product.description}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] text-white/52">
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                      <p className="text-white/36">Bahan</p>
                      <p className="mt-1 font-medium text-white/76">{product.material}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                      <p className="text-white/36">Ukuran</p>
                      <p className="mt-1 font-medium text-white/76">{product.size}</p>
                    </div>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                    <p className="text-[16px] font-semibold text-[color:var(--brand-green)]">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleWishlist(product)}
                        disabled={wishlistBusyId === product.id}
                        aria-pressed={wishlistIds.includes(product.id)}
                        className={`product-action ${wishlistIds.includes(product.id) ? "product-action-primary" : "product-action-secondary"} disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {wishlistBusyId === product.id ? "..." : wishlistIds.includes(product.id) ? "Tersimpan" : "Wishlist"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleCompare(product)}
                        aria-pressed={compareIds.includes(product.id)}
                        className={`product-action ${compareIds.includes(product.id) ? "product-action-primary" : "product-action-secondary"}`}
                      >
                        Bandingkan
                      </button>
                      <button onClick={() => handleAddCart(product)} className="product-action product-action-primary">
                        Keranjang
                      </button>
                    </div>
                  </div>
                  {session?.user.role === "ADMIN" && (
                    <Link href={`/products/${product.id}/edit`} className="mt-4 text-[13px] font-medium text-white/56 underline underline-offset-4">
                      Edit produk
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="product-card p-10 text-center">
            <h3 className="text-[22px] font-semibold">Produk tidak ditemukan</h3>
            <p className="mt-2 text-[14px] text-white/56">Coba ganti kata kunci atau filter bahan.</p>
          </div>
        )}
      </section>

      <footer className="border-t border-white/10 bg-[#050706] py-14 text-white">
        <div className="content-wrap grid gap-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2 text-[20px] font-semibold">
              <span className="h-4 w-4 rounded-full bg-[color:var(--brand-green)]" />
              CV Banbuk Store
            </Link>
            <h2 className="mt-6 max-w-xl text-[30px] font-semibold leading-tight">
              Katalog, checkout, wishlist, dan inquiry dalam satu etalase CV Banbuk.
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-6 text-[14px]">
            {["Produk", "Akun", "Bantuan"].map((group) => (
              <div key={group}>
                <p className="mb-4 text-[11px] font-semibold uppercase text-white/40">{group}</p>
                <Link href="/products" className="block py-1.5 text-white/62">Katalog</Link>
                <Link href="/dashboard" className="block py-1.5 text-white/62">Dashboard</Link>
                <button type="button" onClick={() => window.dispatchEvent(new Event("banbuk-cart-open"))} className="block py-1.5 text-left text-white/62">Keranjang</button>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
