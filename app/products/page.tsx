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

export default function ProductsPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

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
  const rest = useMemo(() => products.slice(1), [products]);

  const handleAddCart = (product: Product) => {
    addCartItem(product);
    setNotice(`${product.name} masuk ke cart.`);
    window.setTimeout(() => setNotice(""), 2600);
  };

  if (loading) {
    return <LoadingScreen label="Memuat katalog" detail="Produk sedang disiapkan." />;
  }

  return (
    <main className="seed-page min-h-screen">
      <div className="seed-topline">Find the right Banbuk products for you {"->"}</div>
      <AppNavbar />

      <section className="seed-hero flex items-center">
        <div className="content-wrap">
          <h1 className="max-w-2xl text-[clamp(34px,5vw,56px)] font-semibold leading-[1.06] tracking-[-0.045em]">
            Curated Daily Goods for Cleaner Storefront Workflows
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-6 text-[#e8efe2]/78">
            Produk pilihan BanbukStore dalam katalog yang lebih ringkas, cepat dipindai, dan siap checkout.
          </p>
        </div>
      </section>

      {notice && (
        <div className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-full bg-[color:var(--seed-lime)] px-5 py-3 text-sm font-bold text-[color:var(--seed-green)]">
          {notice}
        </div>
      )}

      {featured && (
        <section className="content-wrap grid gap-4 py-4 lg:grid-cols-[1fr_280px]">
          <div className="seed-card-green grid gap-5 p-5 md:grid-cols-[0.74fr_1fr] md:p-6">
            <div className="relative flex min-h-[230px] items-center justify-center">
              <span className="absolute left-0 top-0 rounded-full bg-[color:var(--seed-lime)] px-3 py-1 text-[12px] font-bold text-[color:var(--seed-green)]">Bestseller</span>
              <ProductImage src={featured.image} alt={featured.name} loading="eager" className="max-h-[210px]" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="w-fit rounded-full border border-current px-2.5 py-1 text-[12px] font-semibold">BS-01</span>
              <h2 className="mt-3 text-[30px] font-semibold leading-[1.08] tracking-[-0.04em]">{featured.name}</h2>
              <p className="mt-3 max-w-lg text-[15px] leading-6 text-[#e5efdf]">{featured.description}</p>
              <p className="mt-4 text-[20px] font-semibold">Rp {featured.price.toLocaleString("id-ID")}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={`/products/${featured.id}`} className="seed-button seed-button-light">Learn More</Link>
                <button onClick={() => handleAddCart(featured)} className="seed-button border border-[color:var(--seed-cream)]">Add To Cart</button>
              </div>
            </div>
          </div>
          <Link href={`/products/${featured.id}`} className="seed-card-green relative min-h-[280px] overflow-hidden p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.22),transparent_16rem)]" />
            <div className="relative flex h-full flex-col justify-end">
              <p className="max-w-[220px] text-[17px] font-semibold leading-snug">Is {featured.name} the right product for you?</p>
              <span className="mt-2 underline underline-offset-4">Take the Quiz</span>
            </div>
          </Link>
        </section>
      )}

      <section className="rounded-t-[24px] bg-[color:var(--seed-cream)] px-3 py-4 text-[color:var(--seed-green)] md:px-5">
        <div className="mx-auto grid max-w-[1180px] gap-4 md:grid-cols-2">
          {rest.map((product, index) => (
            <article key={product.id} className="seed-card grid min-h-[270px] gap-5 p-5 md:grid-cols-[0.82fr_1fr] md:p-6">
              <Link href={`/products/${product.id}`} className="relative flex min-h-[220px] items-center justify-center">
                <span className="absolute left-0 top-0 rounded-full bg-[#c5cda3] px-3 py-1 text-[12px] font-bold">{index < 3 ? "New" : "Daily"}</span>
                <ProductImage src={product.image} alt={product.name} variant={index % 3 === 2 ? "box" : "jar"} className="max-h-[190px]" />
              </Link>
              <div className="flex flex-col justify-center">
                <span className="w-fit rounded-full border border-current px-2 py-1 text-[11px] font-semibold">BN-02</span>
                <Link href={`/products/${product.id}`}>
                  <h2 className="mt-3 text-[24px] font-semibold leading-[1.15] tracking-[-0.035em]">{product.name}</h2>
                </Link>
                <p className="mt-3 line-clamp-3 text-[14px] leading-6">{product.description}</p>
                <p className="mt-4 text-[18px] font-semibold">Rp {product.price.toLocaleString("id-ID")}</p>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <Link href={`/products/${product.id}`} className="seed-button">Learn More</Link>
                  <button onClick={() => handleAddCart(product)} className="seed-link">Add To Cart</button>
                </div>
                {session?.user.role === "ADMIN" && (
                  <Link href={`/products/${product.id}/edit`} className="mt-5 text-sm font-bold underline underline-offset-4">
                    Edit product
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {products.length === 0 && (
        <section className="content-wrap py-16">
          <div className="rounded-2xl bg-[color:var(--seed-cream)] p-10 text-center text-[color:var(--seed-green)]">Belum ada produk yang tersedia.</div>
        </section>
      )}

      <footer className="bg-[color:var(--seed-green)] px-6 py-14 text-[color:var(--seed-cream)]">
        <div className="mx-auto grid max-w-[1280px] gap-12 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="flex items-center gap-2 text-[30px] font-semibold tracking-[-0.04em]">BanbukStore<span className="h-4 w-4 rounded-full bg-[color:var(--seed-lime)]" /></p>
            <h2 className="mt-6 max-w-2xl text-[28px] font-semibold leading-[1.12] tracking-[-0.04em]">
              Daily products, cleaner checkout, and account workflows in one storefront.
            </h2>
            <div className="mt-10 flex max-w-lg overflow-hidden rounded-lg border border-[#e8efe2]/60">
              <input className="flex-1 bg-transparent px-5 py-4 text-[#e8efe2] outline-none placeholder:text-[#e8efe2]/60" placeholder="Sign Up For Our Newsletter" />
              <button className="px-5">→</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-8 text-sm">
            {["Products", "About", "Legal"].map((group) => (
              <div key={group}>
                <p className="mb-5 font-bold uppercase text-[#e8efe2]/60">{group}</p>
                <Link href="/products" className="block py-1.5">Shop All</Link>
                <Link href="/dashboard" className="block py-1.5">My Account</Link>
                <Link href="/cart" className="block py-1.5">Cart</Link>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
