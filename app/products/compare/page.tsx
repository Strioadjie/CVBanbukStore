"use client";

import AppNavbar from "@/components/AppNavbar";
import LoadingScreen from "@/components/LoadingScreen";
import ProductImage from "@/components/ProductImage";
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

const COMPARE_KEY = "compare-products";
const MAX_COMPARE_ITEMS = 2;

function normalizeCompareIds(ids: string[]) {
  return Array.from(new Set(ids.filter((id) => id.length > 0))).slice(0, MAX_COMPARE_ITEMS);
}

function readCompareIds() {
  try {
    const storedCompare = localStorage.getItem(COMPARE_KEY);
    const parsed: unknown = storedCompare ? JSON.parse(storedCompare) : [];
    return Array.isArray(parsed) ? normalizeCompareIds(parsed.filter((id): id is string => typeof id === "string")) : [];
  } catch {
    return [];
  }
}

function writeCompareIds(ids: string[]) {
  localStorage.setItem(COMPARE_KEY, JSON.stringify(normalizeCompareIds(ids)));
}

const formatPrice = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

export default function CompareProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setCompareIds(readCompareIds());

    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        const productList = Array.isArray(data) ? data : [];
        setProducts(productList);
        setCompareIds((currentIds) => {
          const validIds = currentIds.filter((id) => productList.some((product) => product.id === id));
          if (validIds.length !== currentIds.length) writeCompareIds(validIds);
          return validIds;
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const selectedProducts = useMemo(
    () => compareIds.map((id) => products.find((product) => product.id === id)).filter((product): product is Product => Boolean(product)),
    [compareIds, products]
  );

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return products;

    return products.filter((product) =>
      [product.name, product.description, product.material, product.size]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [products, query]);

  const comparisonRows = useMemo(
    () => [
      ["Harga", selectedProducts.map((product) => formatPrice(product.price))],
      ["Stok", selectedProducts.map((product) => `${product.stock} unit`)],
      ["Bahan", selectedProducts.map((product) => product.material)],
      ["Ukuran", selectedProducts.map((product) => product.size)],
      ["Deskripsi", selectedProducts.map((product) => product.description)],
    ] as Array<[string, string[]]>,
    [selectedProducts]
  );

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2400);
  };

  const updateCompareIds = (next: string[], message: string) => {
    setCompareIds(next);
    writeCompareIds(next);
    showNotice(message);
  };

  const toggleCompare = (product: Product) => {
    const currentIds = readCompareIds();
    const selected = currentIds.includes(product.id);

    if (selected) {
      updateCompareIds(currentIds.filter((id) => id !== product.id), `${product.name} dihapus dari compare.`);
      return;
    }

    if (currentIds.length >= MAX_COMPARE_ITEMS) {
      showNotice("Maksimal dua produk. Hapus salah satu dulu untuk mengganti pilihan.");
      return;
    }

    updateCompareIds([...currentIds, product.id], `${product.name} ditambahkan ke compare.`);
  };

  const clearCompare = () => updateCompareIds([], "Pilihan compare dikosongkan.");

  if (loading) {
    return <LoadingScreen label="Memuat perbandingan produk" detail="Data produk sedang disejajarkan untuk dibandingkan." />;
  }

  return (
    <main className="product-page min-h-screen pb-16 text-white">
      <AppNavbar />

      {notice && (
        <div className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-full border border-[rgba(0,212,164,0.28)] bg-[color:var(--brand-green)] px-5 py-3 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(0,212,164,0.22)]">
          {notice}
        </div>
      )}

      <section className="content-wrap grid gap-6 pb-8 pt-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
        <div>
          <p className="section-kicker">Compare</p>
          <h1 className="mt-2 max-w-4xl text-[38px] font-semibold leading-[1.04] text-white md:text-[56px]">
            Perbandingan produk
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/58">
            Pilih maksimal dua produk untuk membandingkan harga, bahan, ukuran, stok, dan deskripsi dalam satu tampilan.
          </p>
        </div>

        <div className="product-card p-4">
          <p className="text-[12px] font-semibold uppercase text-white/42">Pilihan aktif</p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <p className="text-[36px] font-semibold leading-none text-[color:var(--brand-green)]">
              {selectedProducts.length}<span className="text-[18px] text-white/38">/{MAX_COMPARE_ITEMS}</span>
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={clearCompare} disabled={selectedProducts.length === 0} className="product-action product-action-secondary disabled:cursor-not-allowed disabled:opacity-40">
                Reset
              </button>
              <Link href="/products" className="product-action product-action-primary">
                Katalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="content-wrap pb-6">
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1].map((slot) => {
            const product = selectedProducts[slot];

            return (
              <article key={slot} className="product-card grid min-h-[190px] grid-cols-[130px_1fr] overflow-hidden sm:grid-cols-[170px_1fr]">
                <div className="product-media p-4">
                  {product ? (
                    <ProductImage src={product.image} alt={product.name} className="max-h-[130px]" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[13px] font-semibold text-white/28">
                      Slot {slot + 1}
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center p-4">
                  {product ? (
                    <>
                      <p className="text-[12px] font-semibold uppercase text-white/36">Produk {slot + 1}</p>
                      <h2 className="mt-1 text-[21px] font-semibold leading-tight text-white">{product.name}</h2>
                      <p className="mt-2 text-[16px] font-semibold text-[color:var(--brand-green)]">{formatPrice(product.price)}</p>
                      <button type="button" onClick={() => toggleCompare(product)} className="product-action product-action-secondary mt-4 w-fit">
                        Hapus
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-[12px] font-semibold uppercase text-white/36">Produk {slot + 1}</p>
                      <h2 className="mt-1 text-[21px] font-semibold leading-tight text-white/72">Belum dipilih</h2>
                      <p className="mt-2 text-[14px] leading-6 text-white/48">Pilih produk dari daftar di bawah untuk mengisi slot ini.</p>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {selectedProducts.length === MAX_COMPARE_ITEMS && (
        <section className="content-wrap pb-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="section-kicker">Matrix</p>
              <h2 className="mt-2 text-[28px] font-semibold leading-tight text-white">Detail yang dibandingkan</h2>
            </div>
          </div>
          <div className="grid gap-3">
            {comparisonRows.map(([label, values]) => (
              <article key={label} className="product-card grid gap-0 overflow-hidden lg:grid-cols-[180px_1fr_1fr]">
                <div className="border-b border-white/8 bg-white/[0.035] p-4 text-[13px] font-semibold uppercase text-white/48 lg:border-b-0 lg:border-r">
                  {label}
                </div>
                {values.map((value, index) => (
                  <div key={`${label}-${index}`} className="border-b border-white/8 p-4 text-[14px] leading-6 text-white/76 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
                    <p className="mb-1 text-[12px] font-semibold text-[color:var(--brand-green)] lg:hidden">{selectedProducts[index]?.name}</p>
                    {value}
                  </div>
                ))}
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="content-wrap pb-10">
        <div className="product-toolbar grid gap-3 p-3 md:grid-cols-[minmax(0,1fr)_180px] md:items-center">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="product-input"
            placeholder="Cari produk untuk dibandingkan"
          />
          <p className="px-2 text-right text-[13px] text-white/46">{visibleProducts.length} produk</p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleProducts.map((product) => {
            const selected = compareIds.includes(product.id);
            const locked = !selected && compareIds.length >= MAX_COMPARE_ITEMS;

            return (
              <article key={product.id} className={`product-card grid grid-cols-[118px_1fr] overflow-hidden ${selected ? "border-[rgba(0,212,164,0.38)]" : ""}`}>
                <div className="product-media p-4">
                  <ProductImage src={product.image} alt={product.name} className="max-h-[100px]" />
                </div>
                <div className="flex flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[17px] font-semibold leading-snug text-white">{product.name}</h3>
                      <p className="mt-1 text-[13px] font-semibold text-[color:var(--brand-green)]">{formatPrice(product.price)}</p>
                    </div>
                    <span className="rounded-md bg-white/[0.06] px-2 py-1 text-[11px] text-white/56">{product.stock}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-white/52">{product.description}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => toggleCompare(product)}
                      disabled={locked}
                      aria-pressed={selected}
                      className={`product-action ${selected ? "product-action-primary" : "product-action-secondary"} disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                      {selected ? "Terpilih" : "Pilih"}
                    </button>
                    <Link href={`/products/${product.id}`} className="product-action product-action-secondary">
                      Detail
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {visibleProducts.length === 0 && (
          <div className="product-card mt-4 p-8 text-center">
            <h3 className="text-[22px] font-semibold text-white">Produk tidak ditemukan</h3>
            <p className="mt-2 text-[14px] text-white/56">Coba kata kunci lain untuk memilih produk compare.</p>
          </div>
        )}
      </section>
    </main>
  );
}
