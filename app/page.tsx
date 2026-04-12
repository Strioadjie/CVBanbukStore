import Link from "next/link";
import AppNavbar from "@/components/AppNavbar";

export default function Home() {
  return (
    <main className="page-shell pb-16">
      <AppNavbar />

      <section className="content-wrap pt-10 sm:pt-14">
        <div className="glass-panel overflow-hidden px-6 py-10 sm:px-10 sm:py-14">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <span className="section-kicker">Product showcase, inquiry, and payment</span>
              <h1 className="section-title max-w-4xl">
                Galeri produk yang terasa premium, rapi untuk tim internal, dan nyaman untuk customer.
              </h1>
              <p className="section-subtitle">
                Virtual Product Gallery Web3 membantu admin mengelola produk, sales memproses inquiry, dan customer melihat katalog hingga melakukan pembayaran manual maupun crypto berbasis Ethereum.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/products" className="app-button-primary">
                  Jelajahi Produk
                </Link>
                <Link href="/register" className="app-button-secondary">
                  Buat Akun Customer
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="metric-card">
                  <p className="metric-label">Role System</p>
                  <p className="metric-value">3</p>
                  <p className="mt-2 text-sm text-slate-600">Admin, Sales, Customer</p>
                </div>
                <div className="metric-card">
                  <p className="metric-label">Payment Flow</p>
                  <p className="metric-value">Hybrid</p>
                  <p className="mt-2 text-sm text-slate-600">Manual, gateway, dan ETH</p>
                </div>
                <div className="metric-card">
                  <p className="metric-label">Target</p>
                  <p className="metric-value">MVP</p>
                  <p className="mt-2 text-sm text-slate-600">Simple, clear, siap dikembangkan</p>
                </div>
              </div>
            </div>

            <div className="glass-card relative overflow-hidden p-6 sm:p-8">
              <div className="absolute inset-x-6 top-6 h-32 rounded-full bg-teal-300/20 blur-3xl" />
              <div className="relative space-y-4">
                <div className="rounded-[24px] bg-slate-900 px-6 py-5 text-white shadow-2xl">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/60">Control center</p>
                  <h2 className="mt-3 text-3xl font-semibold">Banbuk Commerce Suite</h2>
                  <p className="mt-3 text-sm leading-6 text-white/75">
                    Dashboard terpadu untuk katalog produk, assignment inquiry, dan pencatatan transaksi berbasis database lokal.
                  </p>
                </div>

                <div className="grid gap-4">
                  {[
                    ["Katalog Elegan", "Card layout modern untuk material, ukuran, stok, dan CTA yang jelas."],
                    ["Inquiry Lebih Rapi", "Admin assign ke sales, lalu status bisa dipantau dalam satu alur."],
                    ["Checkout Fleksibel", "Customer bisa memilih pembayaran biasa, gateway, atau crypto testnet."],
                  ].map(([title, description]) => (
                    <div key={title} className="rounded-[24px] border border-white/70 bg-white/80 p-5">
                      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="content-wrap mt-10 grid gap-6 lg:grid-cols-3">
        {[
          ["Admin", "Kelola produk, stok, user, inquiry, laporan, dan insight produk populer."],
          ["Sales", "Terima assignment, follow up customer, ubah status, dan hubungi via WhatsApp."],
          ["Customer", "Lihat katalog, simpan wishlist, kirim inquiry, dan lanjut ke pembayaran."],
        ].map(([title, description]) => (
          <div key={title} className="glass-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">{title}</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">{title} Experience</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
