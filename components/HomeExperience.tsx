"use client";

import Link from "next/link";

const platformTiles = [
  {
    tone: "product-tile-dark",
    title: "Katalog yang memberi ruang pada produk.",
    copy: "Setiap item tampil sebagai objek utama: foto besar, spesifikasi ringkas, dan aksi yang tidak mengganggu keputusan customer.",
    primary: "Lihat Store",
    href: "/products",
  },
  {
    tone: "product-tile-parchment",
    title: "Inquiry, sales, dan stok tersusun rapi.",
    copy: "Admin dan sales bekerja dari satu alur yang tenang: assignment jelas, status mudah dibaca, dan dashboard fokus pada hal penting.",
    primary: "Masuk Dashboard",
    href: "/dashboard",
  },
];

export default function HomeExperience() {
  return (
    <div className="relative z-10">
      <section className="product-tile product-tile-light">
        <p className="section-kicker">CV Banbuk Mandiri Jaya</p>
        <h1 className="max-w-4xl text-[clamp(40px,6vw,56px)] font-semibold leading-[1.07] tracking-[-0.28px] text-[color:var(--ink)]">
          Product gallery yang bersih, tenang, dan siap dipakai tim.
        </h1>
        <p className="max-w-3xl text-[clamp(21px,3vw,28px)] font-normal leading-[1.14] tracking-[0.196px] text-[color:var(--ink-muted-80)]">
          Katalog, inquiry, wishlist, dan pembayaran disusun seperti store modern: UI menghilang, produk yang berbicara.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/products" className="app-button-primary">
            Lihat Katalog
          </Link>
          <Link href="/register" className="app-button-secondary">
            Buat Akun
          </Link>
        </div>
        <div className="product-shadow mt-8 flex aspect-[16/7] w-full max-w-5xl items-center justify-center overflow-hidden bg-[color:var(--canvas-parchment)]">
          <div className="grid h-full w-full grid-cols-3">
            <div className="flex items-center justify-center bg-white p-8">
              <span className="text-[clamp(28px,4vw,56px)] font-semibold tracking-[-0.28px] text-[color:var(--ink)]">Store</span>
            </div>
            <div className="flex items-center justify-center bg-[color:var(--surface-tile-1)] p-8">
              <span className="text-[clamp(28px,4vw,56px)] font-semibold tracking-[-0.28px] text-white">Inquiry</span>
            </div>
            <div className="flex items-center justify-center bg-[color:var(--canvas-parchment)] p-8">
              <span className="text-[clamp(28px,4vw,56px)] font-semibold tracking-[-0.28px] text-[color:var(--ink)]">Pay</span>
            </div>
          </div>
        </div>
      </section>

      {platformTiles.map((tile) => (
        <section key={tile.title} className={`product-tile ${tile.tone}`}>
          <h2 className="max-w-3xl text-[clamp(34px,4vw,40px)] font-semibold leading-[1.1] tracking-[-0.28px]">
            {tile.title}
          </h2>
          <p className={`max-w-3xl text-[24px] font-light leading-[1.5] ${tile.tone.includes("dark") ? "text-[color:var(--body-muted)]" : "text-[color:var(--ink-muted-80)]"}`}>
            {tile.copy}
          </p>
          <Link href={tile.href} className="app-button-primary">
            {tile.primary}
          </Link>
        </section>
      ))}

      <section className="bg-[color:var(--canvas)] px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-5 md:grid-cols-3">
          {[
            ["Admin", "Kelola produk, stok, inquiry, user, dan laporan dari satu tempat."],
            ["Sales", "Prioritaskan follow-up customer dengan status dan assignment yang jelas."],
            ["Customer", "Jelajah produk, simpan wishlist, kirim inquiry, lalu checkout dengan mudah."],
          ].map(([title, copy]) => (
            <div key={title} className="store-utility-card">
              <h3 className="text-[17px] font-semibold leading-[1.24] tracking-[-0.374px] text-[color:var(--ink)]">{title}</h3>
              <p className="mt-3 text-[17px] leading-[1.47] tracking-[-0.374px] text-[color:var(--ink-muted-80)]">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-[color:var(--canvas-parchment)] px-5 py-16 text-[12px] leading-none tracking-[-0.12px] text-[color:var(--ink-muted-48)] sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p>CV Banbuk Mandiri Jaya. Katalog, inquiry, dan pembayaran dalam satu pengalaman.</p>
          <div className="flex flex-wrap gap-5 text-[color:var(--ink-muted-80)]">
            <Link href="/products">Store</Link>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
