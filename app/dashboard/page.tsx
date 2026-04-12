"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AppNavbar from "@/components/AppNavbar";
import InteractiveCard from "@/components/InteractiveCard";
import LoadingScreen from "@/components/LoadingScreen";
import { jsPDF } from "jspdf";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const roleCopy = {
  ADMIN: {
    title: "Dashboard Admin",
    subtitle: "Pantau produk, inquiry, dan transaksi dari satu tampilan yang lebih bersih.",
  },
  SALES: {
    title: "Dashboard Sales",
    subtitle: "Lihat assignment yang aktif dan prioritaskan follow-up customer.",
  },
  CUSTOMER: {
    title: "Dashboard Customer",
    subtitle: "Cek wishlist, inquiry, dan riwayat transaksi Anda dengan cepat.",
  },
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
  const [stockPeriod, setStockPeriod] = useState<"weekly" | "monthly">("weekly");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickStats = useMemo(() => {
    if (!session || !stats) return [];

    if (session.user.role === "ADMIN") {
      return [
        ["Total Produk", stats.totalProducts, "Seluruh item yang ada di katalog"],
        ["Total Inquiry", stats.totalInquiries, "Semua inquiry yang masuk"],
        ["Inquiry Pending", stats.pendingInquiries, "Butuh tindak lanjut"],
        ["Stok Rendah", stats.lowStockProducts, "Produk yang perlu diprioritaskan"],
      ];
    }

    if (session.user.role === "SALES") {
      return [
        ["Assigned Inquiry", stats.assignedInquiries, "Inquiry yang sedang Anda tangani"],
        ["Pending", stats.pendingInquiries, "Masih menunggu follow-up"],
        ["Selesai", stats.completedInquiries, "Inquiry yang sudah ditutup"],
      ];
    }

    return [
      ["My Inquiry", stats.myInquiries, "Inquiry yang pernah Anda kirim"],
      ["Wishlist", stats.myWishlists, "Produk favorit yang Anda simpan"],
      ["Transaksi", stats.myTransactions, "Pembayaran yang sudah tercatat"],
    ];
  }, [session, stats]);

  const salesChartData = useMemo(() => {
    const transactions = stats?.completedTransactions ?? [];
    const currency = new Intl.NumberFormat("id-ID");

    const bucketMap = new Map<string, { label: string; revenue: number; orders: number }>();

    transactions.forEach((transaction: any) => {
      const date = new Date(transaction.createdAt);
      let key = "";
      let label = "";

      if (chartPeriod === "daily") {
        key = date.toISOString().slice(0, 10);
        label = date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
      } else if (chartPeriod === "weekly") {
        const current = new Date(date);
        const day = current.getDay() || 7;
        current.setDate(current.getDate() - day + 1);
        key = current.toISOString().slice(0, 10);
        label = `Minggu ${current.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}`;
      } else if (chartPeriod === "monthly") {
        key = `${date.getFullYear()}-${date.getMonth()}`;
        label = date.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
      } else {
        key = `${date.getFullYear()}`;
        label = `${date.getFullYear()}`;
      }

      const current = bucketMap.get(key) ?? { label, revenue: 0, orders: 0 };
      current.revenue += transaction.amount;
      current.orders += 1;
      bucketMap.set(key, current);
    });

    return Array.from(bucketMap.values()).map((item) => ({
      ...item,
      revenueLabel: `Rp ${currency.format(item.revenue)}`,
    }));
  }, [chartPeriod, stats]);

  const stockMovementData = useMemo(() => {
    const products = stats?.productsSnapshot ?? [];
    const transactions = stats?.completedTransactions ?? [];
    const buckets = new Map<string, { label: string; incoming: number; outgoing: number }>();

    const addBucket = (key: string, label: string, field: "incoming" | "outgoing", value: number) => {
      const current = buckets.get(key) ?? { label, incoming: 0, outgoing: 0 };
      current[field] += value;
      buckets.set(key, current);
    };

    const toKeyLabel = (dateValue: string | Date) => {
      const date = new Date(dateValue);
      if (stockPeriod === "weekly") {
        const current = new Date(date);
        const day = current.getDay() || 7;
        current.setDate(current.getDate() - day + 1);
        return {
          key: current.toISOString().slice(0, 10),
          label: `Minggu ${current.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}`,
        };
      }

      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
      };
    };

    products.forEach((product: any) => {
      const bucket = toKeyLabel(product.createdAt);
      addBucket(bucket.key, bucket.label, "incoming", product.stock);
    });

    transactions.forEach((transaction: any) => {
      const bucket = toKeyLabel(transaction.createdAt);
      addBucket(bucket.key, bucket.label, "outgoing", 1);
    });

    return Array.from(buckets.values());
  }, [stats, stockPeriod]);

  const lowStockNotifications = useMemo(
    () => (stats?.productsSnapshot ?? []).filter((product: any) => product.stock <= 5).slice(0, 5),
    [stats]
  );

  const exportProductsCsv = async () => {
    const res = await fetch("/api/products");
    const products = await res.json();
    const rows = [
      ["Nama", "Harga", "Stok", "Bahan", "Ukuran"],
      ...products.map((product: any) => [
        product.name,
        product.price,
        product.stock,
        product.material,
        product.size,
      ]),
    ];
    downloadCsv("laporan-produk.csv", rows);
  };

  const exportInquiryCsv = async () => {
    const res = await fetch("/api/inquiry");
    const inquiries = await res.json();
    const rows = [
      ["Produk", "Customer", "Status", "Sales", "Tanggal"],
      ...inquiries.map((inquiry: any) => [
        inquiry.product?.name ?? "",
        inquiry.user?.name ?? "",
        inquiry.status,
        inquiry.sales?.name ?? "",
        new Date(inquiry.createdAt).toLocaleString("id-ID"),
      ]),
    ];
    downloadCsv("laporan-inquiry.csv", rows);
  };

  const exportSummaryPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Laporan Dashboard Admin", 14, 18);
    doc.setFontSize(11);
    doc.text(`Total Produk: ${stats.totalProducts}`, 14, 34);
    doc.text(`Total Inquiry: ${stats.totalInquiries}`, 14, 42);
    doc.text(`Stok Rendah: ${stats.lowStockProducts}`, 14, 50);
    doc.text(`Total Revenue: Rp ${stats.totalRevenue?.toLocaleString()}`, 14, 58);
    doc.text("Produk Terpopuler:", 14, 72);

    let y = 82;
    (stats.popularProducts ?? []).forEach((item: any, index: number) => {
      doc.text(`${index + 1}. ${item.product?.name ?? "-"} - ${item.inquiryCount} inquiry`, 18, y);
      y += 8;
    });

    doc.save("dashboard-admin-summary.pdf");
  };

  const downloadCsv = (filename: string, rows: (string | number)[][]) => {
    const csvContent = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (status === "loading" || loading) {
    return <LoadingScreen label="Menyiapkan dashboard" detail="Ringkasan role, statistik, dan insight sedang diproses." />;
  }

  if (!session) {
    return null;
  }

  const currentRole = roleCopy[session.user.role as keyof typeof roleCopy];

  return (
    <main className="page-shell pb-16">
      <AppNavbar />

      <section className="content-wrap pt-8">
        <div className="glass-panel editorial-shell grain-overlay px-6 py-8 sm:px-8 sm:py-10">
          <span className="section-kicker">Overview</span>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="section-title">{currentRole.title}</h1>
              <p className="section-subtitle">
                {currentRole.subtitle} Selamat datang, {session.user.name}.
              </p>
            </div>
            <div className="glass-card px-5 py-4 text-sm text-slate-400">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Role aktif</p>
              <p className="mt-2 text-xl font-semibold text-slate-100">{session.user.role}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="content-wrap mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {quickStats.map(([label, value, helper]) => (
          <InteractiveCard key={String(label)} className="metric-card">
            <p className="metric-label">{label}</p>
            <p className="metric-value">{value ?? 0}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">{helper}</p>
          </InteractiveCard>
        ))}
      </section>

      {session.user.role === "ADMIN" && stats && (
        <section className="content-wrap mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-panel p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-300">Notifications</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-50">Notifikasi sederhana</h2>
              </div>
              <span className="status-pill bg-rose-500/15 text-rose-300">Admin alerts</span>
            </div>

            <div className="mt-6 space-y-4">
              <InteractiveCard className="glass-card p-4">
                <p className="text-sm font-semibold text-slate-50">Inquiry baru menunggu tindak lanjut</p>
                <p className="mt-2 text-sm text-slate-300">
                  Saat ini ada {stats.pendingInquiries} inquiry dengan status pending.
                </p>
              </InteractiveCard>
              <InteractiveCard className="glass-card p-4">
                <p className="text-sm font-semibold text-slate-50">Stok hampir habis</p>
                <p className="mt-2 text-sm text-slate-300">
                  Ada {stats.lowStockProducts} produk dengan stok 5 atau kurang.
                </p>
              </InteractiveCard>
              {lowStockNotifications.map((product: any) => (
                <InteractiveCard key={product.id} className="glass-card p-4">
                  <p className="text-sm font-semibold text-slate-50">{product.name}</p>
                  <p className="mt-2 text-sm text-slate-300">Stok tersisa {product.stock}. Pertimbangkan restock.</p>
                </InteractiveCard>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">Export</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-50">Unduh laporan</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Admin bisa mengekspor data produk, inquiry, dan ringkasan dashboard. CSV bisa dibuka di Excel.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <button onClick={exportProductsCsv} className="app-button-secondary w-full">Export Produk CSV</button>
              <button onClick={exportInquiryCsv} className="app-button-secondary w-full">Export Inquiry CSV</button>
              <button onClick={exportSummaryPdf} className="app-button-primary w-full">Export Summary PDF</button>
            </div>
          </div>
        </section>
      )}

      {session.user.role === "ADMIN" && stats && (
        <section className="content-wrap mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="glass-panel p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-300">Insight</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-50">Produk terpopuler</h2>
              </div>
              <span className="status-pill bg-teal-500/15 text-teal-300">Top inquiry</span>
            </div>
            <div className="mt-6 space-y-4">
              {stats.popularProducts?.length ? (
                stats.popularProducts.map((item: any, index: number) => (
                  <InteractiveCard key={index} className="glass-card flex items-center justify-between p-4">
                    <div>
                      <p className="text-lg font-semibold text-slate-50">{item.product?.name}</p>
                      <p className="mt-1 text-sm text-slate-300">Produk ini sering masuk ke alur inquiry customer.</p>
                    </div>
                    <span className="status-pill bg-slate-900 text-white">{item.inquiryCount} inquiry</span>
                  </InteractiveCard>
                ))
              ) : (
                <div className="empty-state text-slate-300">Belum ada data produk populer.</div>
              )}
            </div>
          </div>

          <div className="glass-panel p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">Revenue</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-50">Ringkasan transaksi</h2>
            <p className="mt-6 text-5xl font-semibold text-slate-50">
              Rp {stats.totalRevenue?.toLocaleString()}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Total {stats.totalTransactions} transaksi berhasil tersimpan di sistem.
            </p>
            <div className="mt-8 rounded-[24px] bg-slate-900 px-5 py-5 text-white">
              <p className="text-xs uppercase tracking-[0.22em] text-white/55">Aksi berikutnya</p>
              <p className="mt-2 text-sm leading-7 text-white/75">
                Fokuskan pengecekan pada stok rendah dan inquiry pending agar tim sales bisa bergerak lebih cepat.
              </p>
            </div>
          </div>
        </section>
      )}

      {session.user.role === "ADMIN" && stats && (
        <section className="content-wrap mt-8">
          <div className="glass-panel p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Sales chart</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-50">Grafik penjualan admin</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  Pantau total penjualan berdasarkan transaksi yang sudah selesai. Tampilan bisa diganti per hari, minggu, bulan, atau tahun.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  ["daily", "Per Hari"],
                  ["weekly", "Per Minggu"],
                  ["monthly", "Per Bulan"],
                  ["yearly", "Per Tahun"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setChartPeriod(value as "daily" | "weekly" | "monthly" | "yearly")}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      chartPeriod === value
                        ? "bg-cyan-400 text-slate-950"
                        : "bg-slate-950/70 text-slate-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 h-[360px] rounded-[28px] border border-slate-800 bg-slate-950/55 p-4 sm:p-6">
              {salesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesChartData}>
                    <defs>
                      <linearGradient id="salesRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0.08} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `Rp ${Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(2, 6, 23, 0.94)",
                        border: "1px solid rgba(45, 212, 191, 0.2)",
                        borderRadius: "18px",
                        color: "#e2e8f0",
                      }}
                      labelStyle={{ color: "#f8fafc" }}
                      formatter={(value: number, _name, entry: any) => [entry.payload.revenueLabel, "Revenue"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2dd4bf"
                      strokeWidth={3}
                      fill="url(#salesRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  Belum ada transaksi selesai untuk ditampilkan di grafik.
                </div>
              )}
            </div>

            {salesChartData.length > 0 && (
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <InteractiveCard className="glass-card p-4">
                  <p className="metric-label">Periode Aktif</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-50">
                    {chartPeriod === "daily"
                      ? "Harian"
                      : chartPeriod === "weekly"
                        ? "Mingguan"
                        : chartPeriod === "monthly"
                          ? "Bulanan"
                          : "Tahunan"}
                  </p>
                </InteractiveCard>
                <InteractiveCard className="glass-card p-4">
                  <p className="metric-label">Bucket Data</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-50">{salesChartData.length}</p>
                </InteractiveCard>
                <InteractiveCard className="glass-card p-4">
                  <p className="metric-label">Puncak Penjualan</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-50">
                    {salesChartData.reduce((max: any, item: any) => (item.revenue > max.revenue ? item : max), salesChartData[0]).revenueLabel}
                  </p>
                </InteractiveCard>
              </div>
            )}
          </div>
        </section>
      )}

      {session.user.role === "ADMIN" && stats && (
        <section className="content-wrap mt-8">
          <div className="glass-panel p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-300">Stock movement</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-50">Laporan pergerakan stok</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  Untuk MVP, barang masuk dihitung dari stok awal saat produk dibuat dan barang keluar dihitung dari transaksi selesai.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  ["weekly", "Mingguan"],
                  ["monthly", "Bulanan"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setStockPeriod(value as "weekly" | "monthly")}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      stockPeriod === value ? "bg-fuchsia-400 text-slate-950" : "bg-slate-950/70 text-slate-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 h-[340px] rounded-[28px] border border-slate-800 bg-slate-950/55 p-4 sm:p-6">
              {stockMovementData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockMovementData}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(2, 6, 23, 0.94)",
                        border: "1px solid rgba(217, 70, 239, 0.2)",
                        borderRadius: "18px",
                        color: "#e2e8f0",
                      }}
                    />
                    <Bar dataKey="incoming" fill="#60a5fa" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="outgoing" fill="#f472b6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  Belum ada data stok untuk periode ini.
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
