"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppNavbar from "@/components/AppNavbar";
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

  const activeSummaryTitle = isSales
    ? salesPriorityInquiry?.product?.name ?? "Tidak ada inquiry pending"
    : `${stats?.pendingInquiries ?? 0} inquiry pending`;
  const activeSummaryDetail = isSales
    ? salesPriorityInquiry
      ? `${salesPriorityInquiry.user?.name ?? "Customer"} menunggu follow-up sejak ${formatDate(salesPriorityInquiry.createdAt)}.`
      : "Semua assignment terlihat rapi saat ini."
    : `${stats?.lowStockProducts ?? 0} produk perlu dicek stoknya.`;

  return (
    <main className="dashboard-page customer-account-page pb-12">
      <AppNavbar />

      <section className="content-wrap pt-6">
        <div className="customer-account-summary">
          <div className="customer-account-top">
            <div className="min-w-0">
              <span className="section-kicker">{isAdmin ? "Command center" : "Sales desk"}</span>
              <h1 className="mt-2 text-[30px] font-semibold leading-[1.04] text-white md:text-[38px]">
                {currentRole.title}
              </h1>
              <p className="mt-2 max-w-xl text-[14px] leading-6 text-white/62">
                {currentRole.subtitle} Selamat datang, {session.user.name}.
              </p>
            </div>
            <div className="customer-account-actions">
              <Link href={primaryAction} className="app-button-primary">
                {primaryActionLabel}
              </Link>
              <Link href={secondaryAction} className="app-button-secondary">
                {secondaryActionLabel}
              </Link>
            </div>
          </div>

          <div className="customer-account-metrics">
            {quickStats.map(([label, value, helper]) => (
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

      {isSales && (
        <section className="content-wrap mt-5 grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
          <div className="customer-account-column">
            <section className="customer-account-panel">
              <div className="customer-account-panel-head">
                <div>
                  <p className="section-kicker">Profil</p>
                  <h2 className="mt-2 text-[20px] font-semibold text-white">Ringkasan kerja</h2>
                </div>
                <span className="status-pill bg-white/10 text-white/70">Sales</span>
              </div>

              <div className="mt-5">
                <div className="customer-account-row customer-account-row-compact">
                  <span className="text-white/42">Nama</span>
                  <span className="font-semibold text-white">{session.user.name}</span>
                </div>
                <div className="customer-account-row customer-account-row-compact">
                  <span className="text-white/42">Aktivitas utama</span>
                  <span className="text-right font-semibold text-white">{activeSummaryTitle}</span>
                </div>
                <div className="customer-account-row customer-account-row-compact">
                  <span className="text-white/42">Catatan</span>
                  <span className="max-w-[210px] text-right text-[13px] font-semibold leading-5 text-white/70">{activeSummaryDetail}</span>
                </div>
              </div>
            </section>

            <section className="customer-account-panel">
              <div className="customer-account-panel-head">
                <div>
                  <p className="section-kicker">Focus</p>
                  <h2 className="mt-2 text-[20px] font-semibold text-white">Prioritas follow-up</h2>
                </div>
                <Link href="/inquiry" className="customer-account-link">Buka inquiry</Link>
              </div>

              <div className="mt-5">
                {salesPendingQueue.length ? (
                  salesPendingQueue.slice(0, 3).map((inquiry) => (
                    <div key={inquiry.id} className="customer-account-row customer-account-inquiry-row">
                      <div className="min-w-0">
                        <p className="customer-account-row-title">{inquiry.product?.name ?? "Produk"}</p>
                        <p className="mt-1 text-[13px] leading-5 text-white/48">
                          {inquiry.user?.name ?? "Customer"} - {formatDate(inquiry.createdAt)}
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
                    Tidak ada inquiry pending saat ini. Cek assignment terbaru untuk memastikan tidak ada follow-up yang tertinggal.
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="customer-account-column">
            <section className="customer-account-panel">
              <div className="customer-account-panel-head">
                <div>
                  <p className="section-kicker">Workflow</p>
                  <h2 className="mt-2 text-[20px] font-semibold text-white">Ritme kerja hari ini</h2>
                </div>
                <span className="status-pill bg-white/10 text-white/70">Ringkas</span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["Pending aktif", stats?.pendingInquiries ?? 0, "Butuh follow-up lebih dulu.", "text-amber-300"],
                  ["Selesai", stats?.completedInquiries ?? 0, "Inquiry yang sudah ditutup.", "text-emerald-300"],
                  ["Total assignment", stats?.assignedInquiries ?? 0, "Semua inquiry yang Anda pegang.", "text-white"],
                ].map(([label, value, helper, tone]) => (
                  <div key={String(label)} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/36">{label}</p>
                    <p className={`mt-2 text-[24px] font-semibold leading-none ${tone}`}>{value}</p>
                    <p className="mt-2 text-[12px] leading-5 text-white/48">{helper}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-white/8 pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36">Rekomendasi singkat</p>
                <p className="mt-2 text-[14px] leading-6 text-white/62">
                  Mulai dari inquiry pending paling lama, lalu lanjut ke assignment terbaru agar waktu respon tetap cepat di sisi customer.
                </p>
              </div>
            </section>

            <section className="customer-account-panel">
              <div className="customer-account-panel-head">
                <div>
                  <p className="section-kicker">Assignments</p>
                  <h2 className="mt-2 text-[20px] font-semibold text-white">Assignment terbaru</h2>
                </div>
                <Link href="/inquiry" className="customer-account-link">Lihat semua</Link>
              </div>

              <div className="mt-5">
                {salesRecentAssignments.length ? (
                  salesRecentAssignments.map((inquiry) => (
                    <div key={inquiry.id} className="customer-account-row customer-account-inquiry-row">
                      <div className="min-w-0">
                        <p className="customer-account-row-title">{inquiry.product?.name ?? "Produk"}</p>
                        <p className="mt-1 text-[13px] leading-5 text-white/48">
                          {inquiry.user?.name ?? "Customer"} - {formatDate(inquiry.createdAt)}
                        </p>
                        <p className="mt-3 line-clamp-2 text-[14px] leading-6 text-white/64">
                          {inquiry.message ? inquiry.message : "Belum ada pesan tambahan pada assignment ini."}
                        </p>
                      </div>
                      <span className={`status-pill shrink-0 ${inquiryToneMap[inquiry.status] ?? "bg-white/10 text-white/70"}`}>
                        {formatStatusLabel(inquiry.status)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="customer-account-empty">Belum ada assignment yang masuk untuk akun sales ini.</div>
                )}
              </div>
            </section>
          </div>
        </section>
      )}

      {isAdmin && stats && (
        <>
          <section className="content-wrap mt-5 grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
            <div className="customer-account-column">
              <section className="customer-account-panel">
                <div className="customer-account-panel-head">
                  <div>
                    <p className="section-kicker">Operasional</p>
                    <h2 className="mt-2 text-[20px] font-semibold text-white">Status katalog</h2>
                  </div>
                  <span className="status-pill bg-white/10 text-white/70">Admin</span>
                </div>

                <div className="mt-5">
                  {[
                    ["Produk", stats.totalProducts, "item katalog"],
                    ["Inquiry", stats.totalInquiries, "percakapan masuk"],
                    ["Pending", stats.pendingInquiries, "butuh tindak lanjut"],
                    ["Stok rendah", stats.lowStockProducts, "produk perlu dicek"],
                  ].map(([label, value, helper]) => (
                    <div key={String(label)} className="customer-account-row customer-account-row-compact">
                      <span className="text-white/42">{label}</span>
                      <span className="text-right font-semibold text-white">{value ?? 0} <span className="font-normal text-white/42">{helper}</span></span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="customer-account-panel">
                <div className="customer-account-panel-head">
                  <div>
                    <p className="section-kicker">Alerts</p>
                    <h2 className="mt-2 text-[20px] font-semibold text-white">Notifikasi</h2>
                  </div>
                  <span className="status-pill bg-[color:var(--brand-green)]/10 text-[color:var(--brand-green)]">Aktif</span>
                </div>

                <div className="mt-5">
                  <div className="customer-account-row">
                    <div>
                      <p className="customer-account-row-title">Inquiry baru menunggu tindak lanjut</p>
                      <p className="mt-1 text-[13px] leading-5 text-white/48">{stats.pendingInquiries} inquiry masih pending.</p>
                    </div>
                  </div>
                  <div className="customer-account-row">
                    <div>
                      <p className="customer-account-row-title">Stok hampir habis</p>
                      <p className="mt-1 text-[13px] leading-5 text-white/48">{stats.lowStockProducts} produk memiliki stok 5 atau kurang.</p>
                    </div>
                  </div>
                  {lowStockNotifications.map((product: any) => (
                    <div key={product.id} className="customer-account-row customer-account-product-row">
                      <div className="min-w-0">
                        <p className="customer-account-row-title">{product.name}</p>
                        <p className="mt-1 text-[13px] leading-5 text-white/48">Pertimbangkan restock produk ini.</p>
                      </div>
                      <span className="status-pill shrink-0 bg-amber-500/15 text-amber-300">{product.stock} stok</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="customer-account-column">
              <section className="customer-account-panel">
                <div className="customer-account-panel-head">
                  <div>
                    <p className="section-kicker">Revenue</p>
                    <h2 className="mt-2 text-[20px] font-semibold text-white">Ringkasan transaksi</h2>
                  </div>
                  <span className="status-pill bg-white/10 text-white/70">{stats.totalTransactions} transaksi</span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
                  <div>
                    <p className="text-[30px] font-semibold leading-none text-[color:var(--brand-green)] md:text-[34px]">
                      Rp {stats.totalRevenue?.toLocaleString("id-ID") ?? "0"}
                    </p>
                    <p className="mt-3 text-[14px] leading-6 text-white/58">
                      Total revenue dari transaksi yang berhasil tersimpan di sistem.
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36">Aksi berikutnya</p>
                    <p className="mt-2 text-[13px] leading-5 text-white/58">Prioritaskan stok rendah dan inquiry pending.</p>
                  </div>
                </div>
              </section>

              <section className="customer-account-panel">
                <div className="customer-account-panel-head">
                  <div>
                    <p className="section-kicker">Insight</p>
                    <h2 className="mt-2 text-[20px] font-semibold text-white">Produk terpopuler</h2>
                  </div>
                  <span className="status-pill bg-[color:var(--brand-green)]/10 text-[color:var(--brand-green)]">Top inquiry</span>
                </div>

                <div className="mt-5">
                  {stats.popularProducts?.length ? (
                    stats.popularProducts.map((item: any, index: number) => (
                      <div key={index} className="customer-account-row customer-account-product-row">
                        <div className="min-w-0">
                          <p className="customer-account-row-title">{item.product?.name}</p>
                          <p className="mt-1 text-[13px] leading-5 text-white/48">Sering masuk ke alur inquiry customer.</p>
                        </div>
                        <span className="status-pill shrink-0 bg-white/10 text-white/70">{item.inquiryCount} inquiry</span>
                      </div>
                    ))
                  ) : (
                    <div className="customer-account-empty">Belum ada data produk populer.</div>
                  )}
                </div>
              </section>

              <section className="customer-account-panel">
                <div className="customer-account-panel-head">
                  <div>
                    <p className="section-kicker">Export</p>
                    <h2 className="mt-2 text-[20px] font-semibold text-white">Unduh laporan</h2>
                  </div>
                </div>
                <p className="mt-4 text-[14px] leading-6 text-white/58">
                  Export data produk, inquiry, dan ringkasan dashboard untuk kebutuhan laporan.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <button onClick={exportProductsCsv} className="app-button-secondary w-full">Produk CSV</button>
                  <button onClick={exportInquiryCsv} className="app-button-secondary w-full">Inquiry CSV</button>
                  <button onClick={exportSummaryPdf} className="app-button-primary w-full">Summary PDF</button>
                </div>
              </section>
            </div>
          </section>

          <section className="content-wrap mt-5">
            <section className="customer-account-panel">
              <div className="customer-account-panel-head">
                <div>
                  <p className="section-kicker">Sales chart</p>
                  <h2 className="mt-2 text-[20px] font-semibold text-white">Grafik penjualan admin</h2>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  {[
                    ["daily", "Hari"],
                    ["weekly", "Minggu"],
                    ["monthly", "Bulan"],
                    ["yearly", "Tahun"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setChartPeriod(value as "daily" | "weekly" | "monthly" | "yearly")}
                      className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                        chartPeriod === value
                          ? "bg-[color:var(--brand-green)] text-[#06100d]"
                          : "border border-white/10 bg-white/[0.03] text-white/62 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-4 max-w-2xl text-[14px] leading-6 text-white/58">
                Pantau total penjualan berdasarkan transaksi selesai dalam tampilan ringkas.
              </p>
              <div className="mt-5 h-[240px] overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] p-3 md:h-[280px] md:p-4">
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
                      <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis
                        stroke="#94a3b8"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                        width={54}
                        tickFormatter={(value) => `Rp ${Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(2, 6, 23, 0.94)",
                          border: "1px solid rgba(0, 212, 164, 0.22)",
                          borderRadius: "12px",
                          color: "#e2e8f0",
                        }}
                        labelStyle={{ color: "#f8fafc" }}
                        formatter={(value: number, _name, entry: any) => [entry.payload.revenueLabel, "Revenue"]}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#00d4a4" strokeWidth={2} fill="url(#salesRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-[14px] text-white/50">
                    Belum ada transaksi selesai untuk ditampilkan di grafik.
                  </div>
                )}
              </div>

              {salesChartData.length > 0 && (
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {[
                    ["Periode aktif", chartPeriod === "daily" ? "Harian" : chartPeriod === "weekly" ? "Mingguan" : chartPeriod === "monthly" ? "Bulanan" : "Tahunan"],
                    ["Bucket data", salesChartData.length],
                    ["Puncak penjualan", salesChartData.reduce((max: any, item: any) => (item.revenue > max.revenue ? item : max), salesChartData[0]).revenueLabel],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/36">{label}</p>
                      <p className="mt-2 break-words text-[16px] font-semibold leading-snug text-white">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </section>

          <section className="content-wrap mt-5">
            <section className="customer-account-panel">
              <div className="customer-account-panel-head">
                <div>
                  <p className="section-kicker">Stock movement</p>
                  <h2 className="mt-2 text-[20px] font-semibold text-white">Laporan pergerakan stok</h2>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  {[
                    ["weekly", "Mingguan"],
                    ["monthly", "Bulanan"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setStockPeriod(value as "weekly" | "monthly")}
                      className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                        stockPeriod === value
                          ? "bg-[color:var(--brand-green)] text-[#06100d]"
                          : "border border-white/10 bg-white/[0.03] text-white/62 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-4 max-w-2xl text-[14px] leading-6 text-white/58">
                Barang masuk dihitung dari stok saat produk dibuat dan barang keluar dari transaksi selesai.
              </p>
              <div className="mt-5 h-[240px] overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] p-3 md:h-[280px] md:p-4">
                {stockMovementData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stockMovementData}>
                      <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                      <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={12} width={36} />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(2, 6, 23, 0.94)",
                          border: "1px solid rgba(0, 212, 164, 0.22)",
                          borderRadius: "12px",
                          color: "#e2e8f0",
                        }}
                      />
                      <Bar dataKey="incoming" fill="#00d4a4" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="outgoing" fill="#3772cf" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-[14px] text-white/50">
                    Belum ada data stok untuk periode ini.
                  </div>
                )}
              </div>
            </section>
          </section>
        </>
      )}
    </main>
  );
}
