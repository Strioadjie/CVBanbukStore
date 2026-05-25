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

      <section className="bg-[color:var(--canvas-parchment)]">
        <div className="content-wrap py-20">
          <span className="section-kicker">Compare</span>
          <h1 className="section-title">Perbandingan produk</h1>
          <p className="section-subtitle">
            Bandingkan maksimal dua produk sekaligus untuk melihat harga, bahan, ukuran, stok, dan deskripsi dalam satu tabel.
          </p>
        </div>
      </section>

      <section className="content-wrap py-8">
        {selectedProducts.length === 2 ? (
          <div className="overflow-hidden rounded-[18px] border border-[color:var(--hairline)] bg-[color:var(--hairline)]">
            <div className="grid gap-px lg:grid-cols-[220px_1fr_1fr]">
              <div className="bg-white p-6" />
              {selectedProducts.map((product) => (
                <div key={product.id} className="bg-white p-6">
                  <div className="overflow-hidden rounded-lg bg-[color:var(--canvas-parchment)] p-7">
                    <div className="aspect-square">
                      <ProductImage src={product.image} alt={product.name} />
                    </div>
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-[21px] font-semibold leading-[1.19] tracking-[0.231px] text-[color:var(--ink)]">{product.name}</h2>
                      <p className="mt-2 text-[17px] text-[color:var(--ink-muted-80)]">Rp {product.price.toLocaleString()}</p>
                    </div>
                    <button onClick={() => removeCompare(product.id)} className="text-[17px] text-[color:var(--primary)]">
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
                  <div className="bg-[color:var(--canvas-parchment)] p-6 text-[14px] font-semibold leading-[1.29] tracking-[-0.224px] text-[color:var(--ink)]">
                    {label}
                  </div>
                  {values.map((value: string, index: number) => (
                    <div key={`${label}-${index}`} className="bg-white p-6 text-[17px] leading-[1.47] tracking-[-0.374px] text-[color:var(--ink-muted-80)]">
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
            <Link href="/products" className="mt-4 inline-flex text-[color:var(--primary)]">
              Kembali ke katalog
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
