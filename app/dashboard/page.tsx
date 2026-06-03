"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
    title: "Akun Saya",
    subtitle: "Lihat pesanan, wishlist, dan aktivitas akun Anda dari satu tampilan yang lebih rapi.",
  },
};

const formatDate = (dateValue: string | Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateValue));

const paymentLabelMap: Record<string, string> = {
  MIDTRANS: "Gateway",
  CRYPTO: "Ethereum",
  REGULAR: "Manual",
};

const inquiryToneMap: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-300",
  SELESAI: "bg-emerald-500/15 text-emerald-300",
  DIPROSES: "bg-sky-500/15 text-sky-300",
};

const formatStatusLabel = (status?: string) =>
  status ? status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) : "-";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [salesInquiries, setSalesInquiries] = useState<any[]>([]);
  const [customerActivity, setCustomerActivity] = useState({
    transactions: [] as any[],
    inquiries: [] as any[],
    wishlists: [] as any[],
  });
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
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      if (session?.user.role === "CUSTOMER") {
        const [statsRes, transactionsRes, inquiriesRes, wishlistRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/transaction"),
          fetch("/api/inquiry"),
          fetch("/api/wishlist"),
        ]);

        const [statsData, transactionsData, inquiriesData, wishlistData] = await Promise.all([
          statsRes.json(),
          transactionsRes.json(),
          inquiriesRes.json(),
          wishlistRes.json(),
        ]);

        setStats(statsData);
        setCustomerActivity({
          transactions: Array.isArray(transactionsData) ? transactionsData.slice(0, 3) : [],
          inquiries: Array.isArray(inquiriesData) ? inquiriesData.slice(0, 3) : [],
          wishlists: Array.isArray(wishlistData) ? wishlistData.slice(0, 3) : [],
        });
        return;
      }

      if (session?.user.role === "SALES") {
        const [statsRes, inquiriesRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/inquiry"),
        ]);

        const [statsData, inquiriesData] = await Promise.all([
          statsRes.json(),
          inquiriesRes.json(),
        ]);

        setStats(statsData);
        setSalesInquiries(Array.isArray(inquiriesData) ? inquiriesData : []);
        return;
      }

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
      ["Inquiry Saya", stats.myInquiries, "Percakapan produk yang pernah Anda kirim"],
      ["Wishlist", stats.myWishlists, "Produk favorit yang Anda simpan"],
      ["Pesanan", stats.myTransactions, "Pembayaran yang sudah tercatat di akun Anda"],
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

  const salesPendingQueue = useMemo(
    () => salesInquiries.filter((inquiry) => inquiry.status === "PENDING"),
    [salesInquiries]
  );

  const salesRecentAssignments = useMemo(
    () => salesInquiries.slice(0, 4),
    [salesInquiries]
  );

  const salesPriorityInquiry = useMemo(
    () => salesPendingQueue[0] ?? salesRecentAssignments[0] ?? null,
    [salesPendingQueue, salesRecentAssignments]
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
  const isAdmin = session.user.role === "ADMIN";
  const isSales = session.user.role === "SALES";
  const isCustomer = session.user.role === "CUSTOMER";
  const latestTransaction = customerActivity.transactions[0];
  const primaryAction = isAdmin ? "/products/add" : isSales ? "/inquiry" : "/products";
  const primaryActionLabel = isAdmin ? "Tambah Produk" : isSales ? "Buka Inquiry" : "Jelajahi Produk";
  const secondaryAction = isAdmin ? "/inquiry" : isSales ? "/products" : "/wishlist";
  const secondaryActionLabel = isAdmin ? "Kelola Inquiry" : isSales ? "Lihat Produk" : "Buka Wishlist";

  if (isCustomer) {
    const customerMetrics = [
      ["Inquiry", stats?.myInquiries ?? customerActivity.inquiries.length, "percakapan"],
      ["Wishlist", stats?.myWishlists ?? customerActivity.wishlists.length, "produk disimpan"],
      ["Pesanan", stats?.myTransactions ?? customerActivity.transactions.length, "transaksi"],
    ];

    return (
      <main className="dashboard-page customer-account-page pb-12">
        <AppNavbar />

        <section className="content-wrap pt-6">
          <div className="customer-account-summary">
            <div className="customer-account-top">
              <div className="min-w-0">
                <span className="section-kicker">Akun pembeli</span>
                <h1 className="mt-2 text-[30px] font-semibold leading-[1.04] text-white md:text-[38px]">
                  {session.user.name}
                </h1>
                <p className="mt-2 max-w-xl text-[14px] leading-6 text-white/62">
                  Ringkasan pesanan, wishlist, dan inquiry aktif dalam tampilan yang lebih ringkas.
                </p>
              </div>
              <div className="customer-account-actions">
                <Link href="/products" className="app-button-primary">
                  Jelajahi Produk
                </Link>
                <Link href="/wishlist" className="app-button-secondary">
                  Wishlist Saya
                </Link>
              </div>
            </div>

            <div className="customer-account-metrics">
              {customerMetrics.map(([label, value, helper]) => (
                <div key={String(label)} className="customer-account-metric">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">{label}</p>
                  <div className="mt-1.5 flex items-end gap-3">
                    <p className="text-[25px] font-semibold leading-none text-white">{value ?? 0}</p>
                    <p className="pb-0.5 text-[12px] text-white/54">{helper}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="content-wrap mt-5 grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
          <div className="customer-account-column">
            <section className="customer-account-panel">
              <div className="customer-account-panel-head">
                <div>
                  <p className="section-kicker">Profil</p>
                  <h2 className="mt-2 text-[20px] font-semibold text-white">Detail akun</h2>
                </div>
                <span className="status-pill bg-white/10 text-white/70">Pembeli</span>
              </div>

              <div className="mt-5">
                <div className="customer-account-row customer-account-row-compact">
                  <span className="text-white/42">Nama</span>
                  <span className="font-semibold text-white">{session.user.name}</span>
                </div>
                <div className="customer-account-row customer-account-row-compact">
                  <span className="text-white/42">Email</span>
                  <span className="break-all text-right font-semibold text-white">{session.user.email}</span>
                </div>
                <div className="customer-account-row customer-account-row-compact">
                  <span className="text-white/42">Aktivitas utama</span>
                  <span className="text-right font-semibold text-white">
                    {latestTransaction?.product?.name ?? "Belum ada pesanan"}
                  </span>
                </div>
              </div>
            </section>

            <section className="customer-account-panel">
              <div className="customer-account-panel-head">
                <div>
                  <p className="section-kicker">Wishlist</p>
                  <h2 className="mt-2 text-[20px] font-semibold text-white">Favorit terbaru</h2>
                </div>
                <Link href="/wishlist" className="customer-account-link">Lihat semua</Link>
              </div>

              <div className="mt-5">
                {customerActivity.wishlists.length ? (
                  customerActivity.wishlists.map((item) => (
                    <div key={item.id} className="customer-account-row customer-account-product-row">
                      <div className="min-w-0">
                        <Link href={`/products/${item.productId}`} className="customer-account-row-title hover:text-[color:var(--brand-green)]">
                          {item.product?.name ?? "Produk"}
                        </Link>
                        <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-white/48">{item.product?.description}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[14px] font-semibold text-[color:var(--brand-green)]">
                          Rp {item.product?.price?.toLocaleString("id-ID")}
                        </p>
                        <Link href={`/products/${item.productId}/payment`} className="mt-2 inline-flex text-[13px] font-semibold text-white/72 hover:text-white">
                          Checkout
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="customer-account-empty">
                    Wishlist masih kosong. Simpan produk dari katalog untuk menampilkannya di sini.
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="customer-account-column">
            <section className="customer-account-panel">
              <div className="customer-account-panel-head">
                <div>
                  <p className="section-kicker">Pesanan</p>
                  <h2 className="mt-2 text-[20px] font-semibold text-white">Transaksi terbaru</h2>
                </div>
                <span className="status-pill bg-[color:var(--brand-green)]/10 text-[color:var(--brand-green)]">
                  {customerActivity.transactions.length} tercatat
                </span>
              </div>

              <div className="mt-5">
                {customerActivity.transactions.length ? (
                  customerActivity.transactions.map((transaction) => (
                    <div key={transaction.id} className="customer-account-row customer-account-order-row">
                      <div className="min-w-0">
                        <p className="customer-account-row-title">{transaction.product?.name ?? "Produk"}</p>
                        <p className="mt-1 text-[13px] leading-5 text-white/48">
                          Checkout pada {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                      <div className="customer-account-statuses">
                        <span className="status-pill bg-white/10 text-white/64">
                          {paymentLabelMap[transaction.paymentType] ?? transaction.paymentType}
                        </span>
                        <span className="status-pill bg-emerald-500/15 text-emerald-300">
                          {formatStatusLabel(transaction.status)}
                        </span>
                      </div>
                      <p className="customer-account-amount">
                        Rp {transaction.amount.toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="customer-account-empty">
                    Belum ada pesanan. Mulai dari katalog saat produk sudah siap dibeli.
                  </div>
                )}
              </div>
            </section>

            <section className="customer-account-panel">
              <div className="customer-account-panel-head">
                <div>
                  <p className="section-kicker">Inquiry</p>
                  <h2 className="mt-2 text-[20px] font-semibold text-white">Percakapan terbaru</h2>
                </div>
                <Link href="/inquiry" className="customer-account-link">Riwayat</Link>
              </div>

              <div className="mt-5">
                {customerActivity.inquiries.length ? (
                  customerActivity.inquiries.map((inquiry) => (
                    <div key={inquiry.id} className="customer-account-row customer-account-inquiry-row">
                      <div className="min-w-0">
                        <p className="customer-account-row-title">{inquiry.product?.name ?? "Produk"}</p>
                        <p className="mt-1 text-[13px] leading-5 text-white/48">
                          Dikirim pada {formatDate(inquiry.createdAt)}
                        </p>
                        <p className="mt-3 line-clamp-2 text-[14px] leading-6 text-white/64">
                          {inquiry.message ? inquiry.message : "Belum ada pesan tambahan pada inquiry ini."}
                        </p>
                      </div>
                      <span className={`status-pill shrink-0 ${inquiryToneMap[inquiry.status] ?? "bg-white/10 text-white/70"}`}>
                        {formatStatusLabel(inquiry.status)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="customer-account-empty">
                    Belum ada inquiry. Kirim pertanyaan dari detail produk untuk mulai diskusi.
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page page-shell pb-10">
      <AppNavbar />

      <section className="content-wrap pt-5">
        <div className="dashboard-hero">
          <div className="max-w-3xl">
            <span className="section-kicker">{isAdmin ? "Command Center" : isSales ? "Sales Desk" : "Akun"}</span>
            <h1 className="mt-2 text-[clamp(30px,4vw,46px)] font-semibold leading-[1.05] text-white">
              {currentRole.title}
            </h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-white/60">
              {currentRole.subtitle} Selamat datang, {session.user.name}.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link href={primaryAction} className="app-button-primary w-full sm:w-auto">
                {primaryActionLabel}
              </Link>
              <Link href={secondaryAction} className="app-button-secondary w-full sm:w-auto">
                {secondaryActionLabel}
              </Link>
            </div>
          </div>

          <div className="dashboard-hero__side">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">Aktivitas utama</p>
            <p className="mt-2 text-base font-semibold text-white">
              {isCustomer
                ? latestTransaction?.product?.name ?? "Belum ada pesanan"
                : isSales
                  ? salesPriorityInquiry?.product?.name ?? "Tidak ada inquiry pending"
                  : `${stats?.pendingInquiries ?? 0} inquiry pending`}
            </p>
            <p className="mt-2 text-[13px] leading-6 text-white/55">
              {isCustomer
                ? latestTransaction
                  ? `Pembayaran ${paymentLabelMap[latestTransaction.paymentType] ?? latestTransaction.paymentType} tercatat pada ${formatDate(latestTransaction.createdAt)}.`
                  : "Mulai dari katalog untuk menyimpan produk atau checkout."
                : isSales
                  ? salesPriorityInquiry
                    ? `${salesPriorityInquiry.user?.name ?? "Customer"} menunggu follow-up sejak ${formatDate(salesPriorityInquiry.createdAt)}.`
                    : "Semua assignment terlihat rapi saat ini."
                  : `${stats?.lowStockProducts ?? 0} produk perlu dicek stoknya.`}
            </p>
          </div>
        </div>
      </section>

      <section className="content-wrap mt-4">
        <div className="dashboard-stat-strip">
          {quickStats.map(([label, value, helper]) => (
            <div key={String(label)} className="dashboard-stat-item">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">{label}</p>
              <div className="mt-2 flex items-end gap-3">
                <p className="text-2xl font-semibold text-white">{value ?? 0}</p>
                <p className="pb-0.5 text-[13px] text-white/50">{helper}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {isSales && (
        <>
          <section className="content-wrap mt-5 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="dashboard-lite-surface p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">Focus</p>
                  <h2 className="mt-2 text-xl font-medium tracking-tight text-slate-50">Prioritas follow-up</h2>
                </div>
                <Link href="/inquiry" className="text-sm font-semibold text-slate-200 hover:text-white">
                  Buka inquiry
                </Link>
              </div>

              <div className="mt-5 grid gap-3">
                {salesPendingQueue.length ? (
                  salesPendingQueue.slice(0, 3).map((inquiry) => (
                    <InteractiveCard key={inquiry.id} disabled className="dashboard-lite-card p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-50">{inquiry.product?.name ?? "Produk"}</p>
                          <p className="mt-1.5 text-sm leading-6 text-slate-400">
                            {inquiry.user?.name ?? "Customer"} • {formatDate(inquiry.createdAt)}
                          </p>
                        </div>
                        <span className={`status-pill ${inquiryToneMap[inquiry.status] ?? "bg-white/10 text-slate-300"}`}>
                          {inquiry.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        {inquiry.message ? inquiry.message : "Belum ada pesan tambahan pada inquiry ini."}
                      </p>
                    </InteractiveCard>
                  ))
                ) : (
                  <div className="dashboard-lite-card px-5 py-8 text-center text-slate-300">
                    Tidak ada inquiry pending saat ini. Anda bisa lanjut mengecek assignment terbaru.
                  </div>
                )}
              </div>
            </div>

            <div className="dashboard-lite-surface p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">Workflow</p>
                  <h2 className="mt-2 text-xl font-medium tracking-tight text-slate-50">Ritme kerja hari ini</h2>
                </div>
                <span className="status-pill bg-white/10 text-slate-300">Sales</span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="dashboard-lite-card p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Pending aktif</p>
                  <p className="mt-3 text-2xl font-semibold text-amber-300">{stats?.pendingInquiries ?? 0}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">Butuh follow-up lebih dulu agar tidak menumpuk.</p>
                </div>
                <div className="dashboard-lite-card p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Selesai</p>
                  <p className="mt-3 text-2xl font-semibold text-emerald-300">{stats?.completedInquiries ?? 0}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">Inquiry yang sudah ditutup dengan rapi.</p>
                </div>
                <div className="dashboard-lite-card p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Total assignment</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-50">{stats?.assignedInquiries ?? 0}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">Semua inquiry yang sedang Anda pegang.</p>
                </div>
              </div>

              <div className="dashboard-lite-card mt-4 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Rekomendasi singkat</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Mulai dari inquiry pending paling lama, lalu lanjut ke assignment terbaru agar waktu respon tetap terasa cepat di sisi customer.
                </p>
              </div>
            </div>
          </section>

          <section className="content-wrap mt-5">
            <div className="dashboard-lite-surface p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">Assignments</p>
                  <h2 className="mt-2 text-xl font-medium tracking-tight text-slate-50">Assignment terbaru</h2>
                </div>
                <Link href="/inquiry" className="text-sm font-semibold text-slate-200 hover:text-white">
                  Lihat semua
                </Link>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                {salesRecentAssignments.length ? (
                  salesRecentAssignments.map((inquiry) => (
                    <InteractiveCard key={inquiry.id} disabled className="dashboard-lite-card p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-50">{inquiry.product?.name ?? "Produk"}</p>
                          <p className="mt-1.5 text-sm leading-6 text-slate-400">
                            {inquiry.user?.name ?? "Customer"} • {formatDate(inquiry.createdAt)}
                          </p>
                        </div>
                        <span className={`status-pill ${inquiryToneMap[inquiry.status] ?? "bg-white/10 text-slate-300"}`}>
                          {inquiry.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        {inquiry.message ? inquiry.message : "Belum ada pesan tambahan pada assignment ini."}
                      </p>
                    </InteractiveCard>
                  ))
                ) : (
                  <div className="dashboard-lite-card px-5 py-8 text-center text-slate-300 lg:col-span-2">
                    Belum ada assignment yang masuk untuk akun sales ini.
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {isCustomer && (
        <>
          <section className="content-wrap mt-5 grid gap-4 xl:grid-cols-[0.88fr_1.12fr]">
            <div className="dashboard-lite-surface p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">Shortcut</p>
                  <h2 className="mt-2 text-xl font-medium tracking-tight text-slate-50">Akses cepat</h2>
                </div>
                <span className="status-pill bg-white/10 text-slate-300">Customer</span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link href="/products" className="dashboard-lite-card p-4 transition-colors hover:border-[color:var(--primary)]/20 hover:bg-white/[0.05]">
                  <p className="text-sm font-semibold text-slate-50">Lihat katalog</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">Temukan produk baru dan lanjutkan ke pembayaran saat sudah siap.</p>
                </Link>
                <Link href="/wishlist" className="dashboard-lite-card p-4 transition-colors hover:border-[color:var(--primary)]/20 hover:bg-white/[0.05]">
                  <p className="text-sm font-semibold text-slate-50">Wishlist saya</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">Buka daftar favorit untuk meninjau item yang ingin dibeli lebih dulu.</p>
                </Link>
              </div>

              <div className="dashboard-lite-card mt-4 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Profil singkat</p>
                <div className="mt-3 space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Nama</span>
                    <span className="font-medium text-slate-100">{session.user.name}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Email</span>
                    <span className="font-medium text-slate-100 break-all text-right">{session.user.email}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Role</span>
                    <span className="font-medium text-slate-100">Customer</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-lite-surface p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">Orders</p>
                  <h2 className="mt-2 text-xl font-medium tracking-tight text-slate-50">Pesanan terbaru</h2>
                </div>
                <span className="status-pill bg-[color:var(--primary)]/10 text-[color:var(--primary)]">
                  {customerActivity.transactions.length} tercatat
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                {customerActivity.transactions.length ? (
                  customerActivity.transactions.map((transaction) => (
                    <InteractiveCard key={transaction.id} disabled className="dashboard-lite-card p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-50">{transaction.product?.name ?? "Produk"}</p>
                          <p className="mt-1.5 text-sm leading-6 text-slate-400">
                            Dibayar pada {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="status-pill bg-white/10 text-slate-300">
                            {paymentLabelMap[transaction.paymentType] ?? transaction.paymentType}
                          </span>
                          <span className="status-pill bg-emerald-500/15 text-emerald-300">
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-4">
                        <p className="text-base font-semibold text-[color:var(--primary)]">
                          Rp {transaction.amount.toLocaleString("id-ID")}
                        </p>
                        <Link href={`/products/${transaction.productId}/payment`} className="text-sm font-semibold text-slate-200 hover:text-white">
                          Bayar lagi
                        </Link>
                      </div>
                    </InteractiveCard>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-white/10 bg-[#141416]/60 px-4 py-6 text-center text-slate-300">
                    <p>Belum ada pesanan yang tercatat.</p>
                    <Link href="/products" className="mt-4 inline-flex font-semibold text-slate-200 hover:text-white">
                      Mulai belanja
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="content-wrap mt-5 grid gap-4 xl:grid-cols-2">
            <div className="dashboard-lite-surface p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">Wishlist</p>
                  <h2 className="mt-2 text-xl font-medium tracking-tight text-slate-50">Favorit terbaru</h2>
                </div>
                <Link href="/wishlist" className="text-sm font-semibold text-slate-200 hover:text-white">
                  Lihat semua
                </Link>
              </div>

              <div className="mt-5 grid gap-3">
                {customerActivity.wishlists.length ? (
                  customerActivity.wishlists.map((item) => (
                    <InteractiveCard key={item.id} disabled className="dashboard-lite-card p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-50">{item.product?.name}</p>
                          <p className="mt-1.5 text-sm leading-6 text-slate-400 line-clamp-2">
                            {item.product?.description}
                          </p>
                        </div>
                        <span className="status-pill bg-white/10 text-slate-300">Wishlist</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-[color:var(--primary)]">
                          Rp {item.product?.price?.toLocaleString("id-ID")}
                        </p>
                        <Link href={`/products/${item.productId}/payment`} className="text-sm font-semibold text-slate-200 hover:text-white">
                          Checkout
                        </Link>
                      </div>
                    </InteractiveCard>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-white/10 bg-[#141416]/60 px-4 py-6 text-center text-slate-300">
                    <p>Wishlist Anda masih kosong.</p>
                    <Link href="/products" className="mt-4 inline-flex font-semibold text-slate-200 hover:text-white">
                      Temukan produk
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="dashboard-lite-surface p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">Inquiry</p>
                  <h2 className="mt-2 text-xl font-medium tracking-tight text-slate-50">Percakapan terbaru</h2>
                </div>
                <span className="status-pill bg-white/10 text-slate-300">Riwayat</span>
              </div>

              <div className="mt-5 grid gap-3">
                {customerActivity.inquiries.length ? (
                  customerActivity.inquiries.map((inquiry) => (
                    <InteractiveCard key={inquiry.id} disabled className="dashboard-lite-card p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-50">{inquiry.product?.name ?? "Produk"}</p>
                          <p className="mt-1.5 text-sm leading-6 text-slate-400">
                            Dikirim pada {formatDate(inquiry.createdAt)}
                          </p>
                        </div>
                        <span className={`status-pill ${inquiryToneMap[inquiry.status] ?? "bg-white/10 text-slate-300"}`}>
                          {inquiry.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        {inquiry.message ? inquiry.message : "Belum ada pesan tambahan pada inquiry ini."}
                      </p>
                    </InteractiveCard>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-white/10 bg-[#141416]/60 px-4 py-6 text-center text-slate-300">
                    <p>Belum ada inquiry yang tersimpan.</p>
                    <Link href="/products" className="mt-4 inline-flex font-semibold text-slate-200 hover:text-white">
                      Jelajahi produk
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {isAdmin && stats && (
        <section className="content-wrap mt-5 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-panel p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
               <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">Notifications</p>
                <h2 className="mt-2 text-2xl font-medium tracking-tight text-slate-50">Notifikasi sederhana</h2>
              </div>
              <span className="status-pill bg-[color:var(--primary)]/10 text-[color:var(--primary)] border border-[color:var(--primary)]/20">Admin alerts</span>
             </div>

            <div className="mt-6 space-y-4">
              <InteractiveCard className="glass-card p-5">
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

          <div className="glass-panel p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">Export</p>
                <h2 className="mt-2 text-2xl font-medium tracking-tight text-slate-50">Unduh laporan</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
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

      {isAdmin && stats && (
        <section className="content-wrap mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="glass-panel p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">Insight</p>
                <h2 className="mt-2 text-2xl font-medium tracking-tight text-slate-50">Produk terpopuler</h2>
              </div>
              <span className="status-pill bg-[color:var(--primary)]/10 text-[color:var(--primary)] border border-[color:var(--primary)]/20">Top inquiry</span>
            </div>
            <div className="mt-6 space-y-4">
              {stats.popularProducts?.length ? (
                stats.popularProducts.map((item: any, index: number) => (
                  <InteractiveCard key={index} className="glass-card flex items-center justify-between p-5">
                    <div>
                      <p className="text-base font-semibold text-slate-50">{item.product?.name}</p>
                      <p className="mt-1 text-sm text-slate-400">Produk ini sering masuk ke alur inquiry customer.</p>
                    </div>
                    <span className="status-pill bg-[#141416] text-[color:var(--primary)] border border-[color:var(--primary)]/20">{item.inquiryCount} inquiry</span>
                  </InteractiveCard>
                ))
              ) : (
                <div className="empty-state text-slate-300">Belum ada data produk populer.</div>
              )}
            </div>
          </div>

          <div className="glass-panel p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">Revenue</p>
            <h2 className="mt-2 text-2xl font-medium tracking-tight text-slate-50">Ringkasan transaksi</h2>
            <p className="mt-6 text-4xl sm:text-5xl font-semibold text-slate-50 tracking-tight text-[color:var(--primary)]">
              Rp {stats.totalRevenue?.toLocaleString()}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Total {stats.totalTransactions} transaksi berhasil tersimpan di sistem.
            </p>
            <div className="mt-5 rounded-[24px] bg-[#141416] border border-white/5 shadow-inner px-4 py-4 text-white">
              <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--primary)]/70 font-semibold">Aksi berikutnya</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Fokuskan pengecekan pada stok rendah dan inquiry pending agar tim sales bisa bergerak lebih cepat.
              </p>
            </div>
          </div>
        </section>
      )}

      {isAdmin && stats && (
        <section className="content-wrap mt-5">
          <div className="glass-panel p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">Sales chart</p>
                <h2 className="mt-2 text-2xl font-medium tracking-tight text-slate-50">Grafik penjualan admin</h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
                  Pantau total penjualan berdasarkan transaksi yang sudah selesai. Tampilan bisa diganti per hari, minggu, bulan, atau tahun.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
                {[
                  ["daily", "Per Hari"],
                  ["weekly", "Per Minggu"],
                  ["monthly", "Per Bulan"],
                  ["yearly", "Per Tahun"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setChartPeriod(value as "daily" | "weekly" | "monthly" | "yearly")}
                    className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                      chartPeriod === value
                        ? "bg-[color:var(--primary)] text-[#101012]"
                        : "bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 h-[300px] rounded-[24px] border border-white/5 bg-[#141416]/50 p-4 sm:p-5 shadow-inner">
              {salesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesChartData}>
                    <defs>
                      <linearGradient id="salesRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00d4a4" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#00d4a4" stopOpacity={0.05} />
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
                        border: "1px solid rgba(0, 212, 164, 0.22)",
                        borderRadius: "18px",
                        color: "#e2e8f0",
                      }}
                      labelStyle={{ color: "#f8fafc" }}
                      formatter={(value: number, _name, entry: any) => [entry.payload.revenueLabel, "Revenue"]}
                    />
                      <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#00d4a4"
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

      {isAdmin && stats && (
        <section className="content-wrap mt-5">
          <div className="glass-panel p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">Stock movement</p>
                <h2 className="mt-2 text-2xl font-medium tracking-tight text-slate-50">Laporan pergerakan stok</h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
                  Untuk MVP, barang masuk dihitung dari stok awal saat produk dibuat dan barang keluar dihitung dari transaksi selesai.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
                {[
                  ["weekly", "Mingguan"],
                  ["monthly", "Bulanan"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setStockPeriod(value as "weekly" | "monthly")}
                    className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                      stockPeriod === value
                        ? "bg-[color:var(--primary)] text-[#101012]"
                        : "bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 h-[300px] rounded-[24px] border border-white/5 bg-[#141416]/50 p-4 sm:p-5 shadow-inner">
              {stockMovementData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockMovementData}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(2, 6, 23, 0.94)",
                        border: "1px solid rgba(0, 212, 164, 0.22)",
                        borderRadius: "18px",
                        color: "#e2e8f0",
                      }}
                    />
                    <Bar dataKey="incoming" fill="#00d4a4" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="outgoing" fill="#3772cf" radius={[6, 6, 0, 0]} />
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
