"use client";

import AppNavbar from "@/components/AppNavbar";
import LoadingScreen from "@/components/LoadingScreen";
import ProductImage from "@/components/ProductImage";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        if (!res.ok) {
          router.push("/products");
          return;
        }
        setProduct(await res.json());
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id, router]);

  if (loading) {
    return <LoadingScreen label="Memuat detail produk" detail="Detail produk sedang disiapkan." />;
  }

  if (!product) return null;

  const addToCart = () => {
    addCartItem(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  };

  return (
    <main className="min-h-screen bg-[color:var(--seed-cream)] text-[color:var(--seed-green)]">
      <AppNavbar />
      {added && (
        <div className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-full bg-[color:var(--seed-lime)] px-5 py-3 text-sm font-bold">
          Added to cart.
        </div>
      )}

      <section className="grid gap-6 p-4 lg:grid-cols-[minmax(0,1.35fr)_420px]">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2 flex min-h-[520px] items-center justify-center rounded-[18px] bg-[#c8d5a7] p-10">
            <ProductImage src={product.image} alt={product.name} loading="eager" />
          </div>
          <div className="flex min-h-[220px] items-center justify-center rounded-[14px] bg-[#85956c] p-8">
            <ProductImage src={product.image} alt={product.name} variant="capsule" />
          </div>
          <div className="flex min-h-[220px] items-center justify-center rounded-[14px] bg-[#163f16] p-8">
            <ProductImage src={product.image} alt={product.name} variant="box" />
          </div>
        </div>

        <aside className="sticky top-[88px] h-fit rounded-[18px] bg-[color:var(--seed-cream)] p-5 lg:p-8">
          <span className="rounded-full border border-current px-3 py-1 text-[12px] font-semibold">DM-02™</span>
          <h1 className="mt-4 text-[42px] font-semibold leading-[1.03] tracking-[-0.055em]">{product.name}</h1>
          <p className="mt-4 text-[18px] leading-7">{product.description}</p>
          <p className="mt-6 text-[24px] font-semibold">Rp {product.price.toLocaleString("id-ID")}</p>
          <p className="mt-2 text-sm text-[color:var(--seed-muted)]">Stock {product.stock}. Size {product.size}. Material {product.material}.</p>
          <button onClick={addToCart} className="seed-button mt-8 w-full">Add To Cart</button>
          <Link href="/cart" className="mt-3 flex h-12 items-center justify-center rounded-full border border-[color:var(--seed-green)] font-bold">
            View Cart
          </Link>
          <div className="mt-8 space-y-4 text-sm">
            {["Naturally supports daily routines", "Designed around simple product education", "Ships with checkout-ready workflow"].map((item) => (
              <div key={item} className="flex gap-3 border-t border-[rgba(17,63,18,0.16)] pt-4">
                <span className="mt-1 h-2 w-2 rounded-full bg-[color:var(--seed-green)]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="relative mx-4 overflow-hidden rounded-[18px] bg-[linear-gradient(90deg,rgba(17,63,18,0.94),rgba(17,63,18,0.44)),radial-gradient(circle_at_80%_20%,rgba(216,255,138,0.28),transparent_22rem)] px-6 py-20 text-[color:var(--seed-cream)] md:px-12">
        <p className="text-sm">Your microbiome needs essential nutrients to function.</p>
        <h2 className="mt-3 max-w-4xl text-[clamp(34px,6vw,58px)] font-semibold leading-[1.04] tracking-[-0.055em]">
          {product.name} is built to support your daily product workflow.
        </h2>
        <div className="mt-14 grid gap-4 md:grid-cols-4">
          {["Helps fill product gaps", "Designed for repeat use", "Feeds the knowledge base", "Whole body support"].map((item) => (
            <div key={item} className="rounded-xl bg-white/10 p-5">
              <div className="mb-6 h-8 w-8 rounded-full border border-white/50" />
              <h3 className="font-semibold">{item}</h3>
              <p className="mt-2 text-sm text-white/70">Clear information architecture for better customer decisions.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 px-4 py-16 lg:grid-cols-[0.95fr_1.2fr]">
        <div className="rounded-[18px] bg-[#173f16] p-8 text-[color:var(--seed-cream)]">
          <div className="mx-auto flex aspect-square max-w-[360px] items-center justify-center">
            <ProductImage src={product.image} alt={product.name} />
          </div>
        </div>
        <div className="rounded-[18px] bg-[#82916a] p-8 text-[color:var(--seed-cream)]">
          <h2 className="max-w-lg text-[38px] font-semibold leading-[1.05] tracking-[-0.05em]">2-in-1 formulation optimized for product discovery</h2>
          <p className="mt-4 max-w-xl text-white/78">Use detail pages to answer the questions customers have before they reach checkout.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {["Benefits", "Ingredients", "Testing", "Reviews"].map((item) => (
              <div key={item} className="rounded-xl bg-white/12 p-5">{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-[38px] font-semibold tracking-[-0.05em]">Benefits that build over time</h2>
          <div className="mt-10 overflow-hidden rounded-[18px] border border-[rgba(17,63,18,0.15)]">
            {["Supports customer clarity", "Makes product specs easy to scan", "Reduces friction before checkout", "Connects catalog to cart"].map((item, index) => (
              <div key={item} className="grid grid-cols-[56px_1fr] border-b border-[rgba(17,63,18,0.12)] bg-[color:var(--seed-cream)] last:border-b-0">
                <div className="flex items-center justify-center bg-[#d7e4c1] font-bold">{index + 1}</div>
                <div className="p-5 font-semibold">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
