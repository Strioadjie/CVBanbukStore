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
    <main className="product-page min-h-screen pb-14 text-white">
      <AppNavbar />

      <section className="content-wrap pb-5 pt-8">
        <div className="product-card grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
          <div>
            <span className="section-kicker">Produk tersimpan</span>
            <h1 className="mt-2 text-[34px] font-semibold leading-[1.05] md:text-[46px]">Wishlist produk</h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-white/60">
              Simpan produk favorit Anda di satu tempat, lalu lanjutkan checkout saat sudah siap.
            </p>
          </div>

          <div className="border-t border-white/10 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">Disimpan</p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <p className="text-3xl font-semibold text-[color:var(--brand-green)]">{wishlists.length}</p>
              <Link href="/products" className="product-action product-action-secondary">
                Katalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="content-wrap pb-10">
        {wishlists.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {wishlists.map((item) => {
              const product = item.product;

              return (
                <InteractiveCard key={item.id} disabled className="product-card grid overflow-hidden sm:grid-cols-[150px_1fr]">
                  <Link href={`/products/${product.id}`} className="product-media min-h-[150px] p-4">
                    <ProductImage src={product.image} alt={product.name} className="max-h-[112px]" />
                  </Link>

                  <div className="flex min-w-0 flex-col p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Wishlist</p>
                        <Link href={`/products/${product.id}`}>
                          <h2 className="mt-1 truncate text-[18px] font-semibold leading-tight text-white">{product.name}</h2>
                        </Link>
                      </div>
                      <span className="rounded-md bg-white/[0.06] px-2 py-1 text-[11px] text-white/60">Stok {product.stock}</span>
                    </div>

                    <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-white/60">{product.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-white/50">
                      <span className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1">{product.material}</span>
                      <span className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1">{product.size}</span>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                      <p className="text-[16px] font-semibold text-[color:var(--brand-green)]">
                        Rp {product.price.toLocaleString("id-ID")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/products/${product.id}/payment`} className="product-action product-action-primary">
                          Checkout
                        </Link>
                        <Link href={`/products/${product.id}`} className="product-action product-action-secondary">
                          Detail
                        </Link>
                        <button type="button" onClick={() => removeFromWishlist(product.id)} className="product-action product-action-secondary">
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </InteractiveCard>
              );
            })}
          </div>
        ) : (
          <div className="product-card p-8 text-center">
            <h2 className="text-[24px] font-semibold text-white">Wishlist masih kosong</h2>
            <p className="mt-2 text-[14px] text-white/60">Pilih produk dari katalog untuk menyimpannya di sini.</p>
            <Link href="/products" className="product-action product-action-primary mt-5">
              Lihat produk
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
