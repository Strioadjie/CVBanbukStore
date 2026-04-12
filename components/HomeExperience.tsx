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
      const mm = gsap.matchMedia();

      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          desktop: "(min-width: 1024px)",
        },
        (context) => {
          const { reduceMotion, desktop } = context.conditions ?? {};
          const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");

          if (reduceMotion || items.length === 0) {
            gsap.set(items, { clearProps: "all" });
            return;
          }

          gsap.set(items, {
            opacity: 0,
            y: desktop ? 28 : 20,
            willChange: "transform, opacity",
          });

          const tl = gsap.timeline({
            defaults: {
              duration: desktop ? 0.82 : 0.68,
              ease: "power3.out",
            },
            onComplete: () => {
              gsap.set(items, { clearProps: "willChange" });
            },
          });

          tl.to(items, {
            opacity: 1,
            y: 0,
            stagger: desktop ? 0.1 : 0.06,
          });
        }
      );

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="flex flex-col relative z-20 min-h-[calc(100vh-140px)] justify-center">
      <section className="content-wrap w-full max-w-5xl mx-auto flex flex-col items-center text-center mt-12 md:mt-16">
        <h1 data-reveal className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] text-[#f2ede4] tracking-tight">
          CV Banbuk <br />
          Mandiri Jaya
        </h1>
        <p data-reveal className="mt-6 text-[17px] md:text-[19px] text-slate-300 tracking-wide font-medium">
          Platform katalog produk, inquiry, dan pembayaran yang siap dipakai secara profesional.
        </p>

        <div data-reveal className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="app-button-primary w-full sm:w-auto px-8">
            Mulai Sekarang
          </Link>
          <Link href="/products" className="app-button-secondary w-full sm:w-auto px-8">
            Lihat Katalog
          </Link>
        </div>
      </section>

      <section className="content-wrap deferred-section w-full max-w-5xl mx-auto mt-20 md:mt-28">
        <div data-reveal className="flex flex-col gap-4">
          <h2 className="text-[13px] md:text-sm font-semibold text-slate-300 tracking-wide mb-2 text-left pl-2">
            Platform Overview
          </h2>

          <div className="glass-panel flex items-center justify-between px-4 py-6 md:px-8 bg-white/5 border-white/10 rounded-2xl md:rounded-[24px]">
            <button className="text-slate-500 hover:text-slate-300 transition-colors p-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-x divide-white/5">
              <div className="flex flex-col items-center gap-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><rect width="14" height="18" x="5" y="3" rx="2"/><path d="M9 7h6"/><path d="M9 11h6"/><path d="M9 15h4"/></svg>
                <span className="text-sm font-medium text-slate-300">Terstruktur</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M21 3v6h-6"/><path d="M21 3 9 15"/><path d="M3 21v-6h6"/><path d="M3 21 15 9"/></svg>
                <span className="text-sm font-medium text-slate-300">Workflow</span>
              </div>
              <div className="flex flex-col items-center gap-3 hidden md:flex">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span className="text-sm font-medium text-slate-300">Siap untuk Tim</span>
              </div>
              <div className="flex flex-col items-center gap-3 hidden lg:flex">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="m16 11 2 2 4-4"/></svg>
                <span className="text-sm font-medium text-slate-300">Siap untuk Customer</span>
              </div>
            </div>
            <button className="text-slate-500 hover:text-slate-300 transition-colors p-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/5 rounded-2xl md:rounded-[24px] bg-white/[0.02] overflow-hidden mt-2">
            {experienceItems.map((item, idx) => (
              <div key={item.label} className={`p-6 md:p-8 flex flex-col gap-2 ${idx !== experienceItems.length - 1 ? 'border-b md:border-b-0 md:border-r border-white/5' : ''}`}>
                <h3 className="text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase">
                  {item.label}
                </h3>
                <p className="text-[14px] leading-relaxed text-slate-300">
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer data-reveal className="content-wrap deferred-section w-full max-w-5xl mx-auto mt-24 mb-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6 text-[13px] text-slate-400">
          <Link href="/" className="hover:text-slate-200 transition-colors">Home</Link>
          <Link href="#" className="hover:text-[color:var(--primary)] transition-colors">About us</Link>
          <Link href="#" className="hover:text-slate-200 transition-colors">Workflow</Link>
          <Link href="#" className="hover:text-slate-200 transition-colors">Contact</Link>
        </div>
        <a
          href="https://github.com/rhmatzeka"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] text-slate-400 transition-colors hover:text-slate-200"
        >
          matsganz@gmail.com
        </a>
      </footer>
    </div>
  );
}
