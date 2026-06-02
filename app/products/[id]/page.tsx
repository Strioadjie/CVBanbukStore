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
  window.dispatchEvent(new Event("banbuk-cart-open"));
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

  const formatPrice = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;
  const stockTone = product.stock <= 5 ? "text-amber-300" : "text-[color:var(--brand-green)]";
  const detailRows = [
    ["Material", product.material],
    ["Ukuran", product.size],
    ["Stok", `${product.stock} unit`],
  ];
  const highlights = [
    ["Produk siap jual", "Informasi produk, stok, dan harga sudah terhubung dengan katalog."],
    ["Checkout fleksibel", "Customer bisa lanjut ke cart, pembayaran manual, gateway, atau crypto."],
    ["Follow-up sales", "Produk dapat diarahkan ke inquiry untuk percakapan lanjutan dengan tim sales."],
  ];

  return (
    <main className="product-page min-h-screen text-white">
      <AppNavbar />
      {added && (
        <div className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-full border border-[rgba(0,212,164,0.25)] bg-[color:var(--brand-green)] px-5 py-3 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(0,212,164,0.22)]">
          Produk masuk ke cart.
        </div>
      )}

      <section className="content-wrap grid gap-5 pb-10 pt-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,420px)] lg:items-start">
        <div className="grid gap-3">
          <div className="product-card overflow-hidden">
            <div className="product-media flex aspect-[16/10] max-h-[460px] min-h-[260px] items-center justify-center p-8 sm:p-10">
              <ProductImage src={product.image} alt={product.name} loading="eager" className="max-h-[330px]" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Front", "jar"],
              ["Variant", "capsule"],
              ["Pack", "box"],
            ].map(([label, variant]) => (
              <div key={label} className="product-card product-media flex aspect-[4/3] items-center justify-center p-5">
                <ProductImage
                  src={product.image}
                  alt={`${product.name} ${label}`}
                  variant={variant as "jar" | "box" | "capsule"}
                  className="max-h-[132px]"
                />
              </div>
            ))}
          </div>

          <div className="product-card p-5 md:p-6">
            <div className="grid gap-5 md:grid-cols-[0.85fr_1.15fr] md:items-start">
              <div>
                <p className="section-kicker">Product Detail</p>
                <h2 className="mt-2 text-[24px] font-semibold leading-tight text-white md:text-[30px]">
                  Ringkasan produk
                </h2>
              </div>
              <p className="text-[14px] leading-6 text-white/60">
                {product.description} Detail ini disiapkan untuk membantu customer menilai produk sebelum lanjut ke cart atau inquiry.
              </p>
            </div>
          </div>
        </div>

        <aside className="product-card sticky top-[88px] h-fit p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="status-pill">Ready</span>
            <span className="status-pill bg-white/[0.06] text-white/68">CV Banbuk Mandiri Jaya</span>
          </div>

          <h1 className="mt-5 text-[34px] font-semibold leading-[1.08] text-white md:text-[44px]">
            {product.name}
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-white/62">{product.description}</p>

          <div className="mt-6 border-y border-white/10 py-5">
            <p className="text-[12px] font-semibold uppercase text-white/38">Harga</p>
            <p className="mt-1 text-[28px] font-semibold text-[color:var(--brand-green)]">
              {formatPrice(product.price)}
            </p>
            <p className={`mt-2 text-[13px] font-medium ${stockTone}`}>
              {product.stock <= 5 ? "Stok terbatas" : "Stok tersedia"} - {product.stock} unit
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            {detailRows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 border-b border-white/8 pb-3 text-[14px] last:border-b-0 last:pb-0">
                <span className="text-white/42">{label}</span>
                <span className="text-right font-medium text-white/82">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-7 grid gap-3">
            <button onClick={addToCart} className="product-action product-action-primary min-h-[46px] w-full text-[14px]">
              Add To Cart
            </button>
            <Link href={`/products/${product.id}/payment`} className="product-action product-action-secondary min-h-[46px] w-full text-[14px]">
              Checkout
            </Link>
          </div>
          <button type="button" onClick={() => window.dispatchEvent(new Event("banbuk-cart-open"))} className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-[14px] font-semibold text-white/78 hover:border-white/20 hover:text-white">
            View Cart
          </button>

          <div className="mt-7 space-y-3 text-[13px] leading-5 text-white/54">
            {["Katalog real-time", "Pembayaran multi-metode", "Inquiry sales tersedia"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--brand-green)]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="content-wrap pb-10">
        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map(([title, copy]) => (
            <article key={title} className="product-card p-5">
              <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(0,212,164,0.24)] bg-[rgba(0,212,164,0.08)] text-[color:var(--brand-green)]">
                <span className="h-2 w-2 rounded-full bg-current" />
              </div>
              <h3 className="text-[17px] font-semibold text-white">{title}</h3>
              <p className="mt-2 text-[14px] leading-6 text-white/56">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-wrap pb-16">
        <div className="product-card overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="product-media flex min-h-[260px] items-center justify-center border-b border-white/8 p-8 lg:border-b-0 lg:border-r">
              <ProductImage src={product.image} alt={product.name} variant="box" className="max-h-[230px]" />
            </div>
            <div className="p-5 md:p-7">
              <p className="section-kicker">Specification</p>
              <h2 className="mt-2 max-w-xl text-[28px] font-semibold leading-tight text-white md:text-[36px]">
                Informasi produk dibuat ringkas untuk scan cepat.
              </h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/58">
                Gunakan detail ini untuk membandingkan bahan, ukuran, stok, dan harga sebelum memasukkan produk ke cart.
              </p>

              <div className="mt-7 overflow-hidden rounded-lg border border-white/10">
                {detailRows.map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[120px_1fr] border-b border-white/8 last:border-b-0">
                    <div className="bg-white/[0.035] px-4 py-3 text-[13px] font-medium text-white/46">{label}</div>
                    <div className="px-4 py-3 text-[14px] font-semibold text-white/82">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
