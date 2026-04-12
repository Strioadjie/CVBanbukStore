"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppNavbar from "@/components/AppNavbar";
import Link from "next/link";
import InteractiveCard from "@/components/InteractiveCard";
import ProductImage from "@/components/ProductImage";

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchWishlists();
    }
  }, [session]);

  const fetchWishlists = async () => {
    try {
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      setWishlists(data);
    } catch (error) {
      console.error("Error fetching wishlists:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const res = await fetch(`/api/wishlist?productId=${productId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchWishlists();
      }
    } catch (error) {
      alert("Gagal menghapus dari wishlist");
    }
  };

  if (loading) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="glass-panel px-8 py-6 text-sm text-slate-300">Memuat wishlist...</div>
      </div>
    );
  }

  return (
    <main className="page-shell pb-16">
      <AppNavbar />

      <section className="content-wrap pt-8">
        <div className="glass-panel px-6 py-8 sm:px-8 sm:py-10">
          <span className="section-kicker">Favorites</span>
          <h1 className="section-title">Wishlist produk</h1>
          <p className="section-subtitle">
            Simpan produk favorit Anda di satu tempat, lalu lanjutkan ke halaman pembayaran saat sudah siap.
          </p>
        </div>
      </section>

      <section className="content-wrap mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {wishlists.map((item) => (
          <InteractiveCard key={item.id} className="glass-panel overflow-hidden">
            <div className="relative h-48 overflow-hidden">
              <ProductImage src={item.product.image} alt={item.product.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-4">
                <span className="status-pill w-fit bg-white/15 text-white">Wishlist item</span>
                <button
                  onClick={() => removeFromWishlist(item.product.id)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-rose-400/50 bg-rose-500/20 text-lg text-rose-300"
                  aria-label="Hapus dari wishlist"
                >
                  ♥
                </button>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h2 className="text-3xl font-semibold text-white">{item.product.name}</h2>
              </div>
            </div>

            <div className="p-6">
              <p className="line-clamp-3 text-sm leading-7 text-slate-300">{item.product.description}</p>
              <p className="mt-5 text-2xl font-semibold text-teal-300">
                Rp {item.product.price.toLocaleString()}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link href={`/products/${item.product.id}/payment`} className="app-button-primary w-full">
                  Lanjut Bayar
                </Link>
                <button onClick={() => removeFromWishlist(item.product.id)} className="app-button-secondary w-full">
                  Hapus
                </button>
              </div>
            </div>
          </InteractiveCard>
        ))}
      </section>

      {wishlists.length === 0 && (
        <section className="content-wrap mt-8">
          <div className="empty-state text-slate-300">
            <p>Wishlist masih kosong.</p>
            <Link href="/products" className="mt-4 inline-flex font-semibold text-teal-700 hover:text-teal-800">
              Lihat produk
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
