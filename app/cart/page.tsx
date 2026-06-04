"use client";

import AppNavbar from "@/components/AppNavbar";
import LoadingScreen from "@/components/LoadingScreen";
import ProductImage from "@/components/ProductImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  material: string;
  size: string;
  image?: string | null;
  quantity: number;
};

const CART_KEY = "banbuk-cart";

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const canUseCart = status === "authenticated" && session?.user.role === "CUSTOMER";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (status === "authenticated" && session?.user.role !== "CUSTOMER") {
      router.replace("/dashboard");
    }
  }, [router, session?.user.role, status]);

  useEffect(() => {
    if (!canUseCart) return;

    const syncCart = () => setItems(JSON.parse(localStorage.getItem(CART_KEY) || "[]"));
    syncCart();
    window.addEventListener("banbuk-cart-updated", syncCart);
    return () => window.removeEventListener("banbuk-cart-updated", syncCart);
  }, [canUseCart]);

  const save = (next: CartItem[]) => {
    setItems(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("banbuk-cart-updated"));
  };

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const discount = Math.round(subtotal * 0.08);
  const total = Math.max(0, subtotal - discount);
  const checkoutHref = items[0] ? `/products/${items[0].id}/payment` : "/products";

  if (status === "loading" || !canUseCart) {
    return <LoadingScreen label="Mengalihkan akses" detail="Keranjang hanya tersedia untuk akun customer." />;
  }

  return (
    <main className="product-page min-h-screen text-white">
      <AppNavbar />

      <section className="content-wrap pb-20 pt-10">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-8 md:flex-row md:items-end">
          <div>
            <p className="section-kicker">Checkout</p>
            <h1 className="mt-2 text-[40px] font-semibold leading-tight md:text-[56px]">Keranjang</h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-6 text-white/56">
              Review item, atur kuantitas, lalu lanjutkan pembayaran tanpa keluar dari alur katalog Banbuk.
            </p>
          </div>
          <Link href="/products" className="mint-pill mint-pill-outline w-fit">
            Lanjut belanja
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="product-card mt-8 p-10 text-center">
            <h2 className="text-[24px] font-semibold">Keranjang masih kosong.</h2>
            <p className="mt-2 text-[14px] text-white/54">Tambahkan produk dari katalog untuk mulai checkout.</p>
            <Link href="/products" className="mint-pill mint-pill-green mt-6">
              Lihat produk
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-3">
              {items.map((item) => (
                <article key={item.id} className="cart-page-item">
                  <Link href={`/products/${item.id}`} className="cart-page-thumb">
                    <ProductImage src={item.image} alt={item.name} className="max-h-[108px]" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-[22px] font-semibold leading-snug">{item.name}</h2>
                        <p className="mt-2 line-clamp-2 text-[14px] leading-6 text-white/56">{item.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => save(items.filter((entry) => entry.id !== item.id))}
                        className="w-fit text-[13px] font-medium text-white/44"
                      >
                        Hapus
                      </button>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-[13px]">
                        <p className="text-white/36">Bahan</p>
                        <p className="mt-1 font-medium text-white/78">{item.material}</p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-[13px]">
                        <p className="text-white/36">Ukuran</p>
                        <p className="mt-1 font-medium text-white/78">{item.size}</p>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <p className="text-[18px] font-semibold text-[color:var(--brand-green)]">
                          Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                        </p>
                        <div className="cart-quantity">
                          <button
                            type="button"
                            onClick={() => save(items.map((entry) => entry.id === item.id ? { ...entry, quantity: Math.max(1, entry.quantity - 1) } : entry))}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => save(items.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry))}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="cart-page-summary">
              <div>
                <p className="section-kicker">Order summary</p>
                <h2 className="mt-2 text-[26px] font-semibold">Ringkasan</h2>
              </div>

              <div className="mt-5 rounded-lg border border-[rgba(0,212,164,0.2)] bg-[rgba(0,212,164,0.08)] p-4 text-[14px] leading-6 text-[color:var(--brand-green)]">
                Diskon checkout otomatis diterapkan sebelum masuk ke pembayaran.
              </div>

              <div className="mt-5 space-y-3 border-y border-white/10 py-5 text-[14px] text-white/58">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Diskon</span>
                  <span>-Rp {discount.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimasi pajak</span>
                  <span>Checkout</span>
                </div>
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <span className="text-[18px] font-semibold">Total</span>
                <span className="text-right text-[28px] font-semibold text-[color:var(--brand-green)]">
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>

              <Link href={checkoutHref} className="mt-6 flex h-12 items-center justify-center rounded-full bg-[color:var(--brand-green)] text-[14px] font-semibold text-black">
                Checkout
              </Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
