"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppNavbar from "@/components/AppNavbar";
import Link from "next/link";
import InteractiveCard from "@/components/InteractiveCard";
import ProductImage from "@/components/ProductImage";
import LoadingScreen from "@/components/LoadingScreen";

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
    return <LoadingScreen label="Memuat wishlist" detail="Daftar produk favorit sedang disiapkan." />;
  }

  return (
    <main className="page-shell pb-16">
      <AppNavbar />

      <section className="bg-[color:var(--canvas-parchment)]">
        <div className="content-wrap py-20">
          <span className="section-kicker">Favorites</span>
          <h1 className="section-title">Wishlist produk</h1>
          <p className="section-subtitle">
            Simpan produk favorit Anda di satu tempat, lalu lanjutkan ke halaman pembayaran saat sudah siap.
          </p>
        </div>
      </section>

      <section className="content-wrap grid gap-5 py-8 md:grid-cols-2 xl:grid-cols-4">
        {wishlists.map((item) => (
          <InteractiveCard key={item.id} disabled className="store-utility-card flex flex-col">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-[color:var(--canvas-parchment)] p-7">
              <ProductImage src={item.product.image} alt={item.product.name} />
              <div className="absolute right-3 top-3">
                <button
                  onClick={() => removeFromWishlist(item.product.id)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--primary)] text-lg text-white"
                  aria-label="Hapus dari wishlist"
                >
                  ♥
                </button>
              </div>
            </div>

            <div className="flex flex-1 flex-col pt-5">
              <h2 className="text-[17px] font-semibold leading-[1.24] tracking-[-0.374px] text-[color:var(--ink)]">{item.product.name}</h2>
              <p className="mt-3 line-clamp-3 text-[14px] leading-[1.43] tracking-[-0.224px] text-[color:var(--ink-muted-80)]">{item.product.description}</p>
              <p className="mt-5 text-[17px] leading-[1.47] tracking-[-0.374px] text-[color:var(--ink-muted-80)]">
                Rp {item.product.price.toLocaleString()}
              </p>

              <div className="mt-auto flex flex-wrap gap-3 pt-6">
                <Link href={`/products/${item.product.id}/payment`} className="app-button-primary min-h-0 px-4 py-2 text-[14px]">
                  Buy
                </Link>
                <button onClick={() => removeFromWishlist(item.product.id)} className="text-[17px] text-[color:var(--primary)]">
                  Hapus
                </button>
              </div>
            </div>
          </InteractiveCard>
        ))}
      </section>

      {wishlists.length === 0 && (
        <section className="content-wrap mt-8">
          <div className="empty-state text-slate-400">
            <p>Wishlist masih kosong.</p>
            <Link href="/products" className="mt-4 inline-flex font-semibold text-slate-200 hover:text-white">
              Lihat produk
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
