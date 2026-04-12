"use client";

type LoadingScreenProps = {
  label?: string;
  detail?: string;
};

export default function LoadingScreen({
  label = "Menyiapkan pengalaman Banbuk",
  detail = "Memuat tampilan, data, dan detail produk dengan transisi yang halus.",
}: LoadingScreenProps) {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4 py-10">
      <div className="loading-stage grain-overlay editorial-shell relative w-full max-w-3xl rounded-[36px] px-8 py-12 sm:px-12 sm:py-14">
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="loading-orbit">
            <div className="loading-ring">
              <span />
              <span />
              <span />
            </div>
            <div className="loading-core" />
          </div>

          <div className="loading-copy mt-8 max-w-xl">
            <p className="section-kicker">Loading experience</p>
            <h2 className="mt-3 text-4xl font-semibold text-slate-900 sm:text-5xl">
              {label}
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              {detail}
            </p>
          </div>

          <div className="editorial-divider mt-8 w-full max-w-lg" />

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.24em] text-slate-500">
            <span>Katalog</span>
            <span>Inquiry</span>
            <span>Pembayaran</span>
          </div>
        </div>
      </div>
    </div>
  );
}
