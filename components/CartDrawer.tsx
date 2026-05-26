"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProductImage from "@/components/ProductImage";

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

function readCart() {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]") as CartItem[];
}

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const syncCart = () => setItems(readCart());
    const openCart = () => {
      syncCart();
      setOpen(true);
    };

    syncCart();
    window.addEventListener("banbuk-cart-updated", syncCart);
    window.addEventListener("banbuk-cart-open", openCart);
    return () => {
      window.removeEventListener("banbuk-cart-updated", syncCart);
      window.removeEventListener("banbuk-cart-open", openCart);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const save = (next: CartItem[]) => {
    setItems(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("banbuk-cart-updated"));
  };

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const discount = Math.round(subtotal * 0.08);
  const total = Math.max(0, subtotal - discount);
  const checkoutHref = items[0] ? `/products/${items[0].id}/payment` : "/products";

  return (
    <div className={`cart-drawer ${open ? "cart-drawer-open" : ""}`} aria-hidden={!open}>
      <button className="cart-drawer-backdrop" type="button" aria-label="Tutup cart" onClick={() => setOpen(false)} />
      <aside className="cart-drawer-panel" aria-label="Cart checkout">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="section-kicker">Checkout</p>
            <h2 className="mt-2 text-[32px] font-semibold leading-tight text-white">Cart</h2>
            <p className="mt-2 text-[14px] leading-6 text-white/54">{items.length} item siap diproses.</p>
          </div>
          <button className="cart-drawer-close" type="button" aria-label="Tutup cart" onClick={() => setOpen(false)}>
            x
          </button>
        </div>

        <div className="mt-6 rounded-lg border border-[rgba(0,212,164,0.2)] bg-[rgba(0,212,164,0.09)] px-4 py-3 text-[14px] font-medium text-[color:var(--brand-green)]">
          Checkout tetap di halaman ini sampai Anda lanjut ke pembayaran.
        </div>

        <div className="mt-5 flex-1 space-y-3 overflow-y-auto pr-1">
          {items.map((item) => (
            <article key={item.id} className="cart-drawer-item">
              <Link href={`/products/${item.id}`} onClick={() => setOpen(false)} className="cart-drawer-thumb">
                <ProductImage src={item.image} alt={item.name} className="max-h-[76px]" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[16px] font-semibold leading-snug text-white">{item.name}</h3>
                    <p className="mt-1 text-[12px] text-white/45">{item.material} / {item.size}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => save(items.filter((entry) => entry.id !== item.id))}
                    className="text-[12px] font-medium text-white/42"
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-[15px] font-semibold text-[color:var(--brand-green)]">
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
            </article>
          ))}

          {items.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-14 text-center">
              <h3 className="text-[20px] font-semibold text-white">Cart masih kosong.</h3>
              <p className="mt-2 text-[14px] text-white/50">Tambahkan produk dari katalog untuk mulai checkout.</p>
            </div>
          )}
        </div>

        <div className="mt-5 border-t border-white/10 pt-5">
          <div className="flex items-center justify-between text-[14px] text-white/54">
            <span>Subtotal</span>
            <span>Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[14px] text-white/54">
            <span>Diskon</span>
            <span>-Rp {discount.toLocaleString("id-ID")}</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-white">
            <span className="text-[20px] font-semibold">Total</span>
            <span className="text-[24px] font-semibold text-[color:var(--brand-green)]">Rp {total.toLocaleString("id-ID")}</span>
          </div>
          <Link
            href={checkoutHref}
            onClick={() => setOpen(false)}
            className={`mt-5 flex h-12 items-center justify-center rounded-full text-[14px] font-semibold ${items.length ? "bg-[color:var(--brand-green)] text-black" : "pointer-events-none bg-white/10 text-white/36"}`}
          >
            Checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}
