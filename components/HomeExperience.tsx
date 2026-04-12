"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const experienceItems = [
  {
    label: "Admin",
    title: "Kontrol produk dan alur inquiry dalam satu tempat.",
    detail: "Manajemen katalog, stok, dan laporan dibuat tetap rapi tanpa kesan dashboard yang berat.",
  },
  {
    label: "Sales",
    title: "Follow-up customer lebih fokus dan lebih ringan dipakai.",
    detail: "Assignment, status, dan komunikasi tetap jelas dengan tampilan yang lebih sederhana.",
  },
  {
    label: "Customer",
    title: "Jelajah katalog yang bersih, cepat, dan tidak melelahkan.",
    detail: "Wishlist, inquiry, dan pembayaran terasa lebih natural di setiap langkahnya.",
  },
];

export default function HomeExperience() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");

      gsap.set(items, { opacity: 0, y: 28 });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.1,
      });
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef}>
      <section className="content-wrap pt-8 sm:pt-12">
        <div className="glass-panel relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.1),transparent_20%),radial-gradient(circle_at_84%_28%,rgba(255,255,255,0.09),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.02),transparent_45%,rgba(255,255,255,0.03))]" />
          <div className="absolute -left-20 top-0 h-80 w-80 rounded-full border border-white/14 opacity-90" />
          <div className="absolute -left-4 top-24 h-52 w-52 rounded-full border border-white/10 opacity-70" />
          <div className="absolute left-[8%] top-[14%] h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute left-[30%] top-[8%] h-px w-44 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
          <div className="absolute left-[42%] top-0 h-24 w-px bg-gradient-to-b from-transparent via-white/22 to-transparent" />
          <div className="absolute right-4 top-8 h-64 w-64 rounded-full border border-white/12 opacity-85" />
          <div className="absolute right-20 top-24 h-32 w-32 rounded-full border border-white/10 opacity-65" />
          <div className="absolute right-[14%] top-[20%] h-52 w-52 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-12 left-10 h-px w-64 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="absolute bottom-7 left-28 h-px w-36 bg-gradient-to-r from-transparent via-white/24 to-transparent" />
          <div className="absolute bottom-10 right-8 h-px w-60 bg-gradient-to-r from-transparent via-white/34 to-transparent" />
          <div className="absolute right-10 top-[18%] h-32 w-px bg-gradient-to-b from-transparent via-white/22 to-transparent" />
          <div className="absolute right-[28%] bottom-0 h-24 w-px bg-gradient-to-b from-transparent via-white/18 to-transparent" />
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="max-w-3xl">
              <span data-reveal className="section-kicker">
                CV Banbuk Mandiri Jaya
              </span>
              <h1 data-reveal className="max-w-3xl text-5xl font-semibold leading-[0.98] text-slate-100 md:text-6xl xl:text-7xl">
                Platform katalog produk dan pembayaran yang dirancang untuk operasional yang lebih rapi.
              </h1>
              <p data-reveal className="section-subtitle max-w-2xl">
                Kelola produk, tindak lanjut inquiry, dan proses pembayaran dalam satu pengalaman yang terasa tenang, jelas, dan profesional.
              </p>

              <div data-reveal className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/products" className="app-button-primary">
                  Lihat Katalog
                </Link>
                <Link href="/register" className="app-button-secondary">
                  Mulai sebagai Customer
                </Link>
              </div>
            </div>

            <div data-reveal className="rounded-[30px] border border-white/10 bg-white/5 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--primary)]">
                Platform overview
              </p>
              <div className="mt-5 space-y-4">
                <div className="rounded-[22px] bg-white/5 p-4">
                  <p className="text-sm text-slate-500">Experience</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-100">Terstruktur dan siap digunakan</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-500">Workflow</p>
                    <p className="mt-2 text-lg font-semibold text-slate-100">Produk, inquiry, pembayaran</p>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-500">Availability</p>
                    <p className="mt-2 text-lg font-semibold text-slate-100">Siap untuk tim internal dan customer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="content-wrap mt-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {experienceItems.map((item) => (
            <article
              key={item.label}
              data-reveal
              className="glass-card p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                {item.label}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-100">
                {item.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                {item.detail}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
