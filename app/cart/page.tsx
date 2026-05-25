"use client";

import AppNavbar from "@/components/AppNavbar";
import ProductImage from "@/components/ProductImage";
import Link from "next/link";
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
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem(CART_KEY) || "[]"));
  }, []);

  const save = (next: CartItem[]) => {
    setItems(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
  };

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const discount = Math.round(subtotal * 0.12);
  const total = Math.max(0, subtotal - discount);

  return (
    <main className="min-h-screen bg-[#d7d9d1] text-[color:var(--seed-green)]">
      <AppNavbar />
      <section className="grid min-h-[calc(100vh-68px)] lg:grid-cols-[1fr_760px]">
        <div className="hidden items-center justify-center overflow-hidden bg-[#a8b596] p-8 lg:flex">
          <div className="aspect-[4/3] w-full max-w-3xl">
            <ProductImage src={items[0]?.image} alt={items[0]?.name || "Cart product"} />
          </div>
        </div>

        <aside className="m-3 rounded-[30px] bg-[color:var(--seed-cream)] p-6 md:p-10">
          <div className="flex items-center justify-between">
            <h1 className="text-[46px] font-semibold tracking-[-0.055em]">Your Cart</h1>
            <Link href="/products" className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e9ece2] text-2xl">×</Link>
          </div>

          <div className="mt-10 rounded-xl bg-[#e7ebdc] px-6 py-5 text-center text-[22px] font-semibold">
            【 📦 You're getting free shipping 】
          </div>

          <div className="mt-8 divide-y divide-[rgba(17,63,18,0.16)]">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-[120px_1fr] gap-6 py-8">
                <Link href={`/products/${item.id}`} className="flex aspect-square items-center justify-center rounded-xl bg-white p-4">
                  <ProductImage src={item.image} alt={item.name} />
                </Link>
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-[24px] font-semibold leading-[1.15] tracking-[-0.04em]">{item.name}</h2>
                      <p className="mt-1 text-[18px] text-[#5d7354]">Delivered monthly</p>
                      <span className="mt-2 inline-block bg-[color:var(--seed-lime)] px-1 text-[16px] font-bold">Rp {Math.round(item.price * 0.12).toLocaleString("id-ID")} off today</span>
                    </div>
                    <button onClick={() => save(items.filter((entry) => entry.id !== item.id))} className="text-[#5d7354]">Remove</button>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-[22px] font-semibold">Rp {item.price.toLocaleString("id-ID")}</p>
                    <div className="flex h-12 items-center overflow-hidden rounded-full border border-[rgba(17,63,18,0.24)]">
                      <button className="px-5 text-2xl" onClick={() => save(items.map((entry) => entry.id === item.id ? { ...entry, quantity: Math.max(1, entry.quantity - 1) } : entry))}>−</button>
                      <span className="px-2 text-xl font-semibold">{item.quantity}</span>
                      <button className="px-5 text-2xl" onClick={() => save(items.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry))}>＋</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {items.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-[24px] font-semibold">Cart masih kosong.</p>
              <Link href="/products" className="seed-button mt-6">Shop products</Link>
            </div>
          )}

          {items.length > 0 && (
            <div className="sticky bottom-0 -mx-6 mt-4 border-t border-[rgba(17,63,18,0.16)] bg-[color:var(--seed-cream)] px-6 py-6 md:-mx-10 md:px-10">
              <div className="flex justify-between text-[20px]">
                <span>Discounts</span>
                <span className="bg-[color:var(--seed-lime)]">-Rp {discount.toLocaleString("id-ID")}</span>
              </div>
              <div className="mt-5 flex justify-between text-[32px] font-semibold">
                <span>Total</span>
                <span>Rp {total.toLocaleString("id-ID")}</span>
              </div>
              <p className="mt-2 text-[18px] text-[#5d7354]">Shipping + taxes calculated at checkout</p>
              <Link href={items[0] ? `/products/${items[0].id}/payment` : "/products"} className="mt-7 flex h-20 items-center justify-center rounded-full bg-[color:var(--seed-green)] text-[24px] font-bold text-[color:var(--seed-cream)]">
                Checkout
              </Link>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
