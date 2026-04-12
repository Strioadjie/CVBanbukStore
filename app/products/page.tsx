"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AppNavbar from "@/components/AppNavbar";
import Link from "next/link";
import InteractiveCard from "@/components/InteractiveCard";
import ProductImage from "@/components/ProductImage";

export default function ProductsPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistMap, setWishlistMap] = useState<Record<string, boolean>>({});
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    const storedCompare = localStorage.getItem("compare-products");
    if (storedCompare) {
      setCompareIds(JSON.parse(storedCompare));
    }
  }, []);

  useEffect(() => {
    if (session?.user.role === "CUSTOMER") {
      fetchWishlistState();
    }
  }, [session]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlistState = async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (!res.ok) return;
      const data = await res.json();
      const mapped = Object.fromEntries(data.map((item: any) => [item.product.id, true]));
      setWishlistMap(mapped);
    } catch (error) {
      console.error("Error fetching wishlist state:", error);
    }
  };

  const addToWishlist = async (productId: string) => {
    try {
      if (wishlistMap[productId]) {
        const res = await fetch(`/api/wishlist?productId=${productId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setWishlistMap((prev) => ({ ...prev, [productId]: false }));
        }
      } else {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

        if (res.ok) {
          setWishlistMap((prev) => ({ ...prev, [productId]: true }));
        } else {
          const data = await res.json();
          alert(data.error || "Gagal menambahkan ke wishlist");
        }
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  const createInquiry = async (productId: string) => {
    try {
      const storedCart = localStorage.getItem("inquiry-cart");
      const cartIds: string[] = storedCart ? JSON.parse(storedCart) : [];
      const nextIds = Array.from(new Set([...cartIds, productId]));
      localStorage.setItem("inquiry-cart", JSON.stringify(nextIds));
      alert("Produk ditambahkan ke keranjang inquiry!");
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  const toggleCompare = (productId: string) => {
    setCompareIds((prev) => {
      const exists = prev.includes(productId);
      let next = prev;

      if (exists) {
        next = prev.filter((id) => id !== productId);
      } else if (prev.length < 2) {
        next = [...prev, productId];
      } else {
        alert("Maksimal 2 produk untuk dibandingkan.");
        next = prev;
      }

      localStorage.setItem("compare-products", JSON.stringify(next));
      return next;
    });
  };

  if (loading) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="glass-panel px-8 py-6 text-sm text-slate-300">Memuat katalog produk...</div>
      </div>
    );
  }

  return (
    <main className="page-shell pb-16">
      <AppNavbar />

      <section className="content-wrap pt-8">
        <div className="glass-panel px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="section-kicker">Catalog</span>
              <h1 className="section-title">Katalog produk Banbuk</h1>
              <p className="section-subtitle">
                Tampilan sekarang memakai dark theme dengan card interaktif, foto produk, dan CTA yang lebih terasa seperti e-commerce modern.
              </p>
            </div>

            {session?.user.role === "ADMIN" && (
              <Link href="/products/add" className="app-button-primary">
                Tambah Produk
              </Link>
            )}

            <div className="flex flex-wrap gap-3">
              <Link href="/products/compare" className="app-button-secondary">
                Compare ({compareIds.length}/2)
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="content-wrap mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <InteractiveCard key={product.id} className="glass-panel overflow-hidden">
            <div className="relative h-56 overflow-hidden">
              <ProductImage src={product.image} alt={product.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
              {session?.user.role === "CUSTOMER" && (
                <button
                  onClick={() => addToWishlist(product.id)}
                  className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border text-lg ${
                    wishlistMap[product.id]
                      ? "border-rose-400/50 bg-rose-500/20 text-rose-300"
                      : "border-white/15 bg-slate-950/45 text-white"
                  }`}
                  aria-label={wishlistMap[product.id] ? "Hapus dari wishlist" : "Tambah ke wishlist"}
                >
                  {wishlistMap[product.id] ? "♥" : "♡"}
                </button>
              )}
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <span className="status-pill w-fit bg-white/15 text-white">Stok {product.stock}</span>
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/65">Material unggulan</p>
                  <h2 className="mt-3 text-3xl font-semibold">{product.name}</h2>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="line-clamp-3 text-sm leading-7 text-slate-300">
                {product.description}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-950/55 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Ukuran</p>
                  <p className="mt-2 text-sm font-semibold text-slate-100">{product.size}</p>
                </div>
                <div className="rounded-2xl bg-slate-950/55 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Bahan</p>
                  <p className="mt-2 text-sm font-semibold text-slate-100">{product.material}</p>
                </div>
                <div className="rounded-2xl bg-slate-950/55 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Harga</p>
                  <p className="mt-2 text-sm font-semibold text-teal-300">Rp {product.price.toLocaleString()}</p>
                </div>
              </div>

              {session?.user.role === "CUSTOMER" && (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button onClick={() => createInquiry(product.id)} className="app-button-secondary w-full">
                    Masuk Keranjang
                  </button>
                  <Link href={`/products/${product.id}/payment`} className="app-button-primary w-full">
                    Beli
                  </Link>
                </div>
              )}

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <button onClick={() => toggleCompare(product.id)} className="app-button-secondary w-full">
                  {compareIds.includes(product.id) ? "Batal Compare" : "Compare"}
                </button>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "628123456789"}?text=${encodeURIComponent(`Saya tertarik dengan produk ${product.name}. Mohon info detailnya.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="app-button-secondary w-full"
                >
                  WhatsApp
                </a>
              </div>

              {session?.user.role === "ADMIN" && (
                <div className="mt-6">
                  <Link href={`/products/${product.id}/edit`} className="app-button-secondary w-full">
                    Edit Produk
                  </Link>
                </div>
              )}
            </div>
          </InteractiveCard>
        ))}
      </section>

      {products.length === 0 && (
        <section className="content-wrap mt-8">
          <div className="empty-state text-slate-300">Belum ada produk yang tersedia.</div>
        </section>
      )}
    </main>
  );
}
