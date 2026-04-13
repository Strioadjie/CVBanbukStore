"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import AppNavbar from "@/components/AppNavbar";
import ProductImage from "@/components/ProductImage";
import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";

export default function CompareProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedCompare = localStorage.getItem("compare-products");
    const ids: string[] = storedCompare ? JSON.parse(storedCompare) : [];
    setCompareIds(ids);

    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const selectedProducts = useMemo(
    () => products.filter((product) => compareIds.includes(product.id)).slice(0, 2),
    [compareIds, products]
  );

  const removeCompare = (productId: string) => {
    const next = compareIds.filter((id) => id !== productId);
    setCompareIds(next);
    localStorage.setItem("compare-products", JSON.stringify(next));
  };

  if (loading) {
    return <LoadingScreen label="Memuat perbandingan produk" detail="Data produk sedang disejajarkan untuk dibandingkan." />;
  }

  return (
    <main className="page-shell pb-16">
      <AppNavbar />

      <section className="content-wrap pt-8">
        <div className="glass-panel px-6 py-8 sm:px-8 sm:py-10">
          <span className="section-kicker">Compare</span>
          <h1 className="section-title">Perbandingan produk</h1>
          <p className="section-subtitle">
            Bandingkan maksimal dua produk sekaligus untuk melihat harga, bahan, ukuran, stok, dan deskripsi dalam satu tabel.
          </p>
        </div>
      </section>

      <section className="content-wrap mt-8">
        {selectedProducts.length === 2 ? (
          <div className="glass-panel overflow-hidden">
            <div className="grid gap-px bg-slate-800 lg:grid-cols-[220px_1fr_1fr]">
              <div className="bg-slate-950/65 p-6" />
              {selectedProducts.map((product) => (
                <div key={product.id} className="bg-slate-950/65 p-6">
                  <div className="overflow-hidden rounded-[24px] border border-slate-800">
                    <div className="h-44">
                      <ProductImage src={product.image} alt={product.name} />
                    </div>
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-semibold text-slate-50">{product.name}</h2>
                      <p className="mt-2 text-sm text-slate-300">Rp {product.price.toLocaleString()}</p>
                    </div>
                    <button onClick={() => removeCompare(product.id)} className="app-button-secondary">
                      Hapus
                    </button>
                  </div>
                </div>
              ))}

              {([
                ["Harga", selectedProducts.map((product) => `Rp ${product.price.toLocaleString()}`)],
                ["Stok", selectedProducts.map((product) => String(product.stock))],
                ["Bahan", selectedProducts.map((product) => product.material)],
                ["Ukuran", selectedProducts.map((product) => product.size)],
                ["Deskripsi", selectedProducts.map((product) => product.description)],
              ] as Array<[string, string[]]>).map(([label, values]) => (
                <Fragment key={String(label)}>
                  <div className="bg-slate-950/45 p-6 text-sm font-semibold text-slate-200">
                    {label}
                  </div>
                  {values.map((value: string, index: number) => (
                    <div key={`${label}-${index}`} className="bg-slate-950/25 p-6 text-sm leading-7 text-slate-300">
                      {value}
                    </div>
                  ))}
                </Fragment>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state text-slate-300">
            <p>Pilih dua produk dari katalog untuk menggunakan fitur compare.</p>
            <Link href="/products" className="mt-4 inline-flex font-semibold text-teal-300 hover:text-teal-200">
              Kembali ke katalog
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
