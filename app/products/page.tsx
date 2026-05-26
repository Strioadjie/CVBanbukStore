"use client";

import AppNavbar from "@/components/AppNavbar";
import LoadingScreen from "@/components/LoadingScreen";
import ProductImage from "@/components/ProductImage";
import { useSession } from "next-auth/react";
import Link from "next/link";
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

function addCartItem(product: Product) {
  const current = JSON.parse(localStorage.getItem(CART_KEY) || "[]") as CartItem[];
  const existing = current.find((item) => item.id === product.id);
  const next = existing
    ? current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
    : [...current, { ...product, quantity: 1 }];
  localStorage.setItem(CART_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("banbuk-cart-updated"));
}

const formatPrice = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

export default function ProductsPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [material, setMaterial] = useState("all");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const featured = products[0];

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
    setNotice(`${product.name} masuk ke cart.`);
    window.setTimeout(() => setNotice(""), 2600);
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

      <section className="product-hero">
        <div className="content-wrap grid gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end lg:py-24">
          <div>
            <p className="section-kicker">Banbuk product catalog</p>
            <h1 className="mt-5 max-w-3xl text-[40px] font-semibold leading-[1.08] md:text-[64px]">
              Katalog produk yang rapi untuk checkout dan inquiry.
            </h1>
            <p className="mt-5 max-w-2xl text-[18px] leading-7 text-white/68">
              Jelajahi produk Banbuk Mandiri Jaya, simpan item favorit, lalu lanjut ke pembayaran gateway, manual, atau Ethereum.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products/compare" className="mint-pill mint-pill-green">
                Compare products
              </Link>
              <Link href={session ? "/dashboard" : "/login"} className="mint-pill mint-pill-outline">
                Dashboard
              </Link>
            </div>
          </div>

          {featured && (
            <Link href={`/products/${featured.id}`} className="product-spotlight block p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="status-pill">Featured</span>
                <span className="text-[13px] text-white/48">{featured.stock} stok</span>
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-[150px_1fr] sm:items-center">
                <div className="product-media h-[150px]">
                  <ProductImage src={featured.image} alt={featured.name} loading="eager" className="max-h-[130px]" />
                </div>
                <div>
                  <h2 className="text-[24px] font-semibold leading-snug">{featured.name}</h2>
                  <p className="mt-2 line-clamp-2 text-[14px] leading-6 text-white/58">{featured.description}</p>
                  <p className="mt-4 text-[18px] font-semibold text-[color:var(--brand-green)]">{formatPrice(featured.price)}</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </section>

      <section className="content-wrap py-8">
        <div className="product-toolbar grid gap-3 p-3 md:grid-cols-[minmax(0,1fr)_220px_190px]">
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
        </div>
      </section>

      <section className="content-wrap pb-20">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="section-kicker">Storefront</p>
            <h2 className="mt-2 text-[32px] font-semibold leading-tight">Produk tersedia</h2>
          </div>
          <p className="text-[14px] text-white/48">{visibleProducts.length} dari {products.length} produk</p>
        </div>

        {visibleProducts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product, index) => (
              <article key={product.id} className="product-card grid min-h-[420px] grid-rows-[210px_1fr] overflow-hidden">
                <Link href={`/products/${product.id}`} className="product-media relative">
                  <span className="absolute left-4 top-4 z-10 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[12px] font-medium text-white/70">
                    {product.stock <= 5 ? "Low stock" : index < 3 ? "Featured" : "Ready"}
                  </span>
                  <ProductImage
                    src={product.image}
                    alt={product.name}
                    variant={index % 3 === 2 ? "box" : "jar"}
                    className="max-h-[170px]"
                  />
                </Link>
                <div className="flex flex-col p-5">
                  <div className="flex items-start justify-between gap-4">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="text-[22px] font-semibold leading-snug">{product.name}</h3>
                    </Link>
                    <span className="rounded-md bg-white/[0.06] px-2 py-1 text-[12px] text-white/58">{product.stock}</span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-[14px] leading-6 text-white/58">{product.description}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-[13px] text-white/52">
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-white/36">Bahan</p>
                      <p className="mt-1 font-medium text-white/76">{product.material}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-white/36">Ukuran</p>
                      <p className="mt-1 font-medium text-white/76">{product.size}</p>
                    </div>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-5">
                    <p className="text-[18px] font-semibold text-[color:var(--brand-green)]">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-2">
                      <Link href={`/products/${product.id}`} className="mint-pill mint-pill-outline">
                        Detail
                      </Link>
                      <button onClick={() => handleAddCart(product)} className="mint-pill mint-pill-green">
                        Cart
                      </button>
                    </div>
                  </div>
                  {session?.user.role === "ADMIN" && (
                    <Link href={`/products/${product.id}/edit`} className="mt-4 text-[13px] font-medium text-white/56 underline underline-offset-4">
                      Edit product
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
              BanbukStore
            </Link>
            <h2 className="mt-6 max-w-xl text-[30px] font-semibold leading-tight">
              Product operations, checkout, and account workflows in one storefront.
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-6 text-[14px]">
            {["Products", "Account", "Support"].map((group) => (
              <div key={group}>
                <p className="mb-4 text-[11px] font-semibold uppercase text-white/40">{group}</p>
                <Link href="/products" className="block py-1.5 text-white/62">Store</Link>
                <Link href="/dashboard" className="block py-1.5 text-white/62">Dashboard</Link>
                <Link href="/cart" className="block py-1.5 text-white/62">Cart</Link>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
