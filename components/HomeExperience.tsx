"use client";

import Link from "next/link";

const trustSignals = ["Produk terkurasi", "Wishlist", "Bandingkan produk", "Inquiry cepat", "Checkout online", "Dashboard pembeli", "Admin katalog", "Sales follow-up"];

const previewMenu = ["Katalog produk", "Wishlist", "Bandingkan", "Inquiry", "Checkout"];

const previewCards = [
  ["Produk ready", "Lihat detail, stok, bahan, ukuran, dan harga dalam satu kartu."],
  ["Bandingkan pilihan", "Pilih dua produk untuk membandingkan harga dan spesifikasi."],
  ["Wishlist", "Simpan produk favorit sebelum checkout atau inquiry."],
  ["Inquiry sales", "Kirim pertanyaan produk dan pantau status follow-up."],
];

const featureCards: Array<[string, string, string[]]> = [
  ["Katalog yang mudah dipilih", "Pembeli bisa mencari produk, melihat detail, menyimpan wishlist, lalu lanjut ke keranjang tanpa alur yang membingungkan.", ["Pencarian", "Filter bahan", "Detail produk"]],
  ["Dashboard untuk operasional", "Admin dan sales bisa memantau produk, inquiry, transaksi, dan aktivitas pembeli dari tampilan yang lebih ringkas.", ["Kelola stok", "Pantau inquiry", "Riwayat checkout"]],
];

const footerGroups: Array<[string, Array<[string, string]>]> = [
  ["Katalog", [["Produk", "/products"], ["Bandingkan", "/products/compare"], ["Wishlist", "/wishlist"]]],
  ["Akun", [["Masuk", "/login"], ["Daftar", "/register"], ["Dashboard", "/dashboard"]]],
  ["Transaksi", [["Keranjang", "/cart"], ["Checkout", "/products"], ["Inquiry", "/inquiry"]]],
  ["CV Banbuk", [["Tentang toko", "/"], ["Kontak", "/inquiry"], ["Bantuan", "/inquiry"]]],
];

export default function HomeExperience() {
  return (
    <div className="mint-page">
      <section className="content-wrap landing-hero text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[13px] text-white/75">
          <span className="rounded bg-[color:var(--brand-green)] px-1.5 py-0.5 text-[10px] font-bold text-black">CV</span>
          Katalog online CV Banbuk Mandiri Jaya
        </div>
        <h1 className="mx-auto mt-8 max-w-4xl text-[clamp(42px,8vw,72px)] font-semibold leading-[1.05] tracking-normal text-white">
          Katalog Produk CV Banbuk Store
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-[18px] leading-7 text-white/68">
          Temukan produk, bandingkan pilihan, simpan wishlist, dan ajukan inquiry langsung ke tim CV Banbuk Mandiri Jaya.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/products" className="mint-pill mint-pill-outline">
            Lihat katalog
          </Link>
          <Link href="/register" className="mint-pill mint-pill-green">
            Buat akun
          </Link>
        </div>

        <div className="mint-card-dark landing-preview mx-auto mt-14 max-w-5xl overflow-hidden text-left">
          <div className="grid border-b border-white/10 text-[13px] text-white/54 md:grid-cols-[220px_1fr_200px]">
            <div className="border-white/10 p-5 md:border-r">
              <div className="mb-5 flex items-center gap-2 text-white">
                <span className="h-3 w-3 rounded-full bg-[color:var(--brand-green)]" />
                CV Banbuk Store
              </div>
              {previewMenu.map((item, index) => (
                <div key={item} className={`rounded-md px-3 py-2 ${index === 0 ? "bg-[rgba(0,212,164,0.12)] text-[color:var(--brand-green)]" : ""}`}>
                  {item}
                </div>
              ))}
            </div>
            <div className="p-6">
              <div className="mb-5 flex gap-5 overflow-x-auto border-b border-white/10 pb-4 text-[13px]">
                <span className="text-[color:var(--brand-green)]">Produk</span>
                <span>Pesanan</span>
                <span>Inquiry</span>
              </div>
              <p className="text-[13px] uppercase tracking-[0.5px] text-[color:var(--brand-green)]">Etalase produk</p>
              <h2 className="mt-2 text-[28px] font-semibold tracking-normal text-white">Produk ready untuk pembeli</h2>
              <p className="mt-2 text-[14px] text-white/52">Semua informasi penting produk disusun jelas sebelum pembeli lanjut ke wishlist, inquiry, atau checkout.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {previewCards.map(([title, copy]) => (
                  <div key={title} className="rounded-xl border border-white/10 bg-[rgba(0,212,164,0.08)] p-5">
                    <div className="mb-5 h-9 w-9 rounded-lg bg-[rgba(0,212,164,0.18)]" />
                    <h3 className="font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-[13px] text-white/50">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden border-l border-white/10 p-5 text-[13px] md:block">
              <p className="mb-4 text-white">Ringkasan</p>
              <p className="text-[color:var(--brand-green)]">Produk pilihan</p>
              <p className="mt-3 text-white/45">Checkout</p>
              <p className="mt-3 text-white/45">Admin & sales</p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-8 text-[15px] font-semibold text-white/64 sm:grid-cols-4">
          {trustSignals.map((item) => (
            <div key={item}>{item}</div>
          ))}
        </div>
      </section>

      <section className="content-wrap py-24 text-center">
        <h2 className="mx-auto max-w-2xl text-[clamp(36px,6vw,56px)] font-semibold leading-[1.1] tracking-normal text-white">
          Belanja dan kelola produk dalam satu tempat
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/58">
          CV Banbuk Store menyatukan katalog, wishlist, fitur bandingkan, inquiry, checkout, dan dashboard agar alur pembeli sampai admin tetap rapi.
        </p>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {featureCards.map(([title, copy, tags]) => (
            <div key={title} className="mint-card-dark p-8 text-left">
              <p className="section-kicker">CV Banbuk</p>
              <h3 className="mt-2 text-[24px] font-semibold tracking-normal text-white">{title}</h3>
              <p className="mt-3 text-white/56">{copy}</p>
              <div className="mt-10 grid gap-3 rounded-xl border border-white/10 bg-[rgba(0,212,164,0.08)] p-4">
                {tags.map((tag) => (
                  <div key={tag} className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/76">
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section data-nav-surface="solid" className="landing-solid-section bg-[#151816] py-24 text-white">
        <div className="content-wrap">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="section-kicker">Operasional toko</p>
              <h2 className="mt-3 max-w-xl text-[42px] font-semibold leading-[1.1] tracking-normal">
                Kelola katalog CV Banbuk lebih rapi
              </h2>
              <p className="mt-4 max-w-xl text-white/58">Produk, stok, inquiry, dan transaksi bisa dipantau dalam alur yang jelas untuk pembeli, sales, dan admin.</p>
            </div>
            <Link href="/products" className="mint-pill mint-pill-light">
              Lihat produk
            </Link>
          </div>
          <div className="landing-story-card mt-12 rounded-2xl border border-white/10 p-8 md:p-12">
            <p className="text-sm font-semibold text-white/70">Alur pembeli</p>
            <h3 className="mt-2 max-w-lg text-[28px] font-semibold tracking-normal">Dari cari produk sampai inquiry dan checkout, semuanya tetap dalam satu etalase CV Banbuk.</h3>
            <div className="mt-16 grid gap-8 sm:grid-cols-2">
              <div className="landing-story-stat">
                <p className="text-[34px] font-semibold tracking-normal">1</p>
                <p className="text-sm text-white/70">Katalog utama untuk semua produk</p>
              </div>
              <div className="landing-story-stat">
                <p className="text-[34px] font-semibold tracking-normal">3+</p>
                <p className="text-sm text-white/70">Alur belanja, inquiry, dan pembayaran</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-nav-surface="solid" className="content-wrap py-24 text-center">
        <h2 className="text-[42px] font-semibold leading-[1.1] tracking-normal text-white">
          Siap belanja di CV Banbuk Store?
        </h2>
        <p className="mt-3 text-white/56">Mulai dari katalog, simpan produk pilihan, lalu lanjutkan ke checkout atau inquiry.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/products" className="mint-pill mint-pill-light">Lihat katalog</Link>
          <Link href="/register" className="mint-pill mint-pill-outline">Buat akun</Link>
        </div>
      </section>

      <footer data-nav-surface="solid" className="border-t border-white/10 py-16 text-white/54">
        <div className="content-wrap grid gap-8 md:grid-cols-[1.2fr_2fr]">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold text-white">
              <span className="h-4 w-4 rounded-full bg-[color:var(--brand-green)]" />
              CV Banbuk Store
            </Link>
            <p className="mt-8 text-sm">Katalog produk online CV Banbuk Mandiri Jaya. © 2026 Banbuk.</p>
          </div>
          <div className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-4">
            {footerGroups.map(([group, links]) => (
              <div key={group}>
                <p className="mb-3 text-white">{group}</p>
                {links.map(([label, href]) => (
                  <Link key={label} href={href} className="block py-1">{label}</Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
