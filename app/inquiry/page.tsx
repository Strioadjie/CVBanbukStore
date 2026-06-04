"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppNavbar from "@/components/AppNavbar";
import LoadingScreen from "@/components/LoadingScreen";

type InquiryNotice = {
  id: number;
  tone: "success" | "info" | "error";
  title: string;
  message: string;
};

const primaryActionClass =
  "inline-flex min-h-10 items-center justify-center rounded-[8px] border border-[rgba(0,212,164,0.55)] bg-[color:var(--brand-green)] px-4 py-2 text-[13px] font-semibold text-[#04100d] shadow-[0_12px_30px_rgba(0,212,164,0.2)] transition-[background-color,border-color,box-shadow,transform,opacity] hover:-translate-y-0.5 hover:border-[rgba(0,212,164,0.82)] hover:bg-[#32e6bd] hover:shadow-[0_16px_36px_rgba(0,212,164,0.26)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand-green)]";

const secondaryActionClass =
  "inline-flex min-h-10 items-center justify-center rounded-[8px] border border-white/[0.12] bg-white/[0.045] px-4 py-2 text-[13px] font-semibold text-white transition-[background-color,border-color,transform,opacity] hover:-translate-y-0.5 hover:border-white/[0.2] hover:bg-white/[0.075] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const selectControlClass =
  "min-h-10 w-full rounded-[8px] border border-white/[0.1] bg-[#07100d] px-3 py-2 text-[13px] font-medium text-white outline-none transition-colors focus:border-[rgba(0,212,164,0.45)] disabled:cursor-not-allowed disabled:opacity-60";

export default function InquiryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [salesUsers, setSalesUsers] = useState<any[]>([]);
  const [busyInquiryId, setBusyInquiryId] = useState<string | null>(null);
  const [inquiryNotice, setInquiryNotice] = useState<InquiryNotice | null>(null);
  const noticeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchInquiries();
      if (session.user.role === "ADMIN") {
        fetchSalesUsers();
      }
    }
  }, [session]);

  useEffect(() => {
    return () => {
      if (noticeTimeoutRef.current) {
        window.clearTimeout(noticeTimeoutRef.current);
      }
    };
  }, []);

  const showInquiryNotice = (notice: Omit<InquiryNotice, "id">) => {
    if (noticeTimeoutRef.current) {
      window.clearTimeout(noticeTimeoutRef.current);
    }

    setInquiryNotice({
      ...notice,
      id: Date.now(),
    });

    noticeTimeoutRef.current = window.setTimeout(() => {
      setInquiryNotice(null);
      noticeTimeoutRef.current = null;
    }, 2800);
  };

  const fetchInquiries = async () => {
    try {
      const res = await fetch("/api/inquiry");
      const data = await res.json();
      setInquiries(data);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesUsers = async () => {
    try {
      const res = await fetch("/api/users?role=SALES");
      const data = await res.json();
      setSalesUsers(data);
    } catch (error) {
      console.error("Error fetching sales users:", error);
    }
  };

  const assignSales = async (inquiryId: string, salesId: string) => {
    if (!salesId) {
      return;
    }

    try {
      setBusyInquiryId(inquiryId);
      const res = await fetch(`/api/inquiry/${inquiryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: salesId }),
      });

      if (res.ok) {
        const updatedInquiry = await res.json();
        setInquiries((prev) =>
          prev.map((inquiry) => (inquiry.id === inquiryId ? updatedInquiry : inquiry))
        );

        const assignedSales = salesUsers.find((sales) => sales.id === salesId);
        showInquiryNotice({
          tone: "success",
          title: "Sales berhasil di-assign",
          message: assignedSales
            ? `${assignedSales.name} sekarang menangani inquiry ini.`
            : "Inquiry berhasil dialihkan ke sales yang dipilih.",
        });
        return;
      }

      const data = await res.json().catch(() => null);
      showInquiryNotice({
        tone: "error",
        title: "Assign gagal",
        message: data?.error || "Sales belum berhasil di-assign ke inquiry ini.",
      });
    } catch (error) {
      showInquiryNotice({
        tone: "error",
        title: "Assign gagal",
        message: "Terjadi kendala saat menghubungkan inquiry ke sales.",
      });
    } finally {
      setBusyInquiryId(null);
    }
  };

  const updateStatus = async (inquiryId: string, nextStatus: string) => {
    try {
      setBusyInquiryId(inquiryId);
      const res = await fetch(`/api/inquiry/${inquiryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        const updatedInquiry = await res.json();
        setInquiries((prev) =>
          prev.map((inquiry) => (inquiry.id === inquiryId ? { ...inquiry, ...updatedInquiry } : inquiry))
        );
        showInquiryNotice({
          tone: "success",
          title: "Status diperbarui",
          message: `Inquiry berhasil diubah menjadi ${nextStatus.toLowerCase()}.`,
        });
        return;
      }

      const data = await res.json().catch(() => null);
      showInquiryNotice({
        tone: "error",
        title: "Update status gagal",
        message: data?.error || "Status inquiry belum berhasil diperbarui.",
      });
    } catch (error) {
      showInquiryNotice({
        tone: "error",
        title: "Update status gagal",
        message: "Terjadi kendala saat memperbarui status inquiry.",
      });
    } finally {
      setBusyInquiryId(null);
    }
  };

  const getWhatsAppLink = (inquiry: any) => {
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "628123456789";
    const message = `Halo ${inquiry.user?.name}, saya dari CV Banbuk Mandiri Jaya. Terkait inquiry produk ${inquiry.product?.name}`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const getStatusColor = (currentStatus: string) => {
    switch (currentStatus) {
      case "PENDING":
        return "border border-amber-400/20 bg-amber-500/10 text-amber-300";
      case "DIPROSES":
        return "border border-sky-400/20 bg-sky-500/10 text-sky-300";
      case "SELESAI":
        return "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
      default:
        return "bg-white/5 border border-white/10 text-slate-300";
    }
  };

  const getStatusLabel = (currentStatus: string) => {
    switch (currentStatus) {
      case "PENDING":
        return "Menunggu";
      case "DIPROSES":
        return "Diproses";
      case "SELESAI":
        return "Selesai";
      default:
        return currentStatus;
    }
  };

  const getSalesDisplayName = (inquiry: any) => {
    const salesName = inquiry.sales?.name?.trim();
    if (!salesName || ["unassigned", "menunggu sales"].includes(salesName.toLowerCase())) {
      return "Belum ditugaskan";
    }

    return salesName;
  };

  const inquirySummary = useMemo(
    () => ({
      total: inquiries.length,
      pending: inquiries.filter((inquiry) => inquiry.status === "PENDING").length,
      diproses: inquiries.filter((inquiry) => inquiry.status === "DIPROSES").length,
      selesai: inquiries.filter((inquiry) => inquiry.status === "SELESAI").length,
    }),
    [inquiries]
  );

  if (loading) {
    return <LoadingScreen label="Memuat inquiry" detail="Percakapan dan status tindak lanjut sedang disiapkan." />;
  }

  return (
    <main className="product-page customer-flow-page min-h-screen pb-14 text-white">
      <AppNavbar />

      {inquiryNotice && (
        <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[130] flex justify-center sm:inset-x-auto sm:right-6 sm:w-auto sm:justify-end">
          <div
            key={inquiryNotice.id}
            className={`pointer-events-auto w-full max-w-[400px] rounded-[10px] border px-4 py-4 shadow-[0_24px_64px_rgba(0,0,0,0.34)] ${
              inquiryNotice.tone === "success"
                ? "border-emerald-400/20 bg-[linear-gradient(135deg,rgba(16,40,28,0.97),rgba(11,18,15,0.98))]"
                : inquiryNotice.tone === "info"
                  ? "border-sky-400/20 bg-[linear-gradient(135deg,rgba(15,34,48,0.97),rgba(10,16,22,0.98))]"
                  : "border-rose-400/20 bg-[linear-gradient(135deg,rgba(52,20,24,0.97),rgba(18,12,14,0.98))]"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] ${
                  inquiryNotice.tone === "success"
                    ? "bg-emerald-400/15 text-emerald-300"
                    : inquiryNotice.tone === "info"
                      ? "bg-sky-400/15 text-sky-300"
                      : "bg-rose-400/15 text-rose-300"
                }`}
              >
                {inquiryNotice.tone === "success" ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                ) : inquiryNotice.tone === "info" ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8h.01" />
                    <path d="M11 12h1v4h1" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="m15 9-6 6" />
                    <path d="m9 9 6 6" />
                  </svg>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{inquiryNotice.title}</p>
                <p className="mt-1.5 text-sm leading-6 text-slate-300">{inquiryNotice.message}</p>
              </div>

              <button
                type="button"
                onClick={() => setInquiryNotice(null)}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300 transition-colors hover:border-white/20 hover:text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="content-wrap pb-4 pt-5">
        <div className="rounded-[10px] border border-white/[0.09] bg-[rgba(8,12,11,0.74)] px-4 py-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] md:px-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)] lg:items-end">
            <div className="min-w-0">
              <span className="section-kicker">Alur inquiry</span>
              <h1 className="mt-2 text-[28px] font-semibold leading-[1.06] text-white md:text-[36px]">
                {session?.user.role === "CUSTOMER" ? "Riwayat inquiry" : "Manajemen inquiry"}
              </h1>
              <p className="mt-2 max-w-2xl text-[14px] leading-6 text-white/60">
                {session?.user.role === "ADMIN"
                  ? "Assign inquiry ke sales dan pantau progres follow-up dalam tampilan yang lebih ringkas."
                  : session?.user.role === "SALES"
                    ? "Prioritaskan inquiry yang perlu ditangani, update status, lalu lanjutkan follow-up customer."
                    : "Pantau progres inquiry produk Anda tanpa perlu membuka banyak halaman."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
              {[
                ["Total", inquirySummary.total, "text-white"],
                ["Pending", inquirySummary.pending, "text-amber-300"],
                ["Diproses", inquirySummary.diproses, "text-sky-300"],
                ["Selesai", inquirySummary.selesai, "text-emerald-300"],
              ].map(([label, value, tone]) => (
                <div key={String(label)} className="min-h-[58px] rounded-[8px] border border-white/[0.09] bg-white/[0.035] px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">{label}</p>
                  <p className={`mt-1 text-lg font-semibold leading-none ${tone}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="content-wrap space-y-3">
        {session?.user.role === "CUSTOMER" && (
          <div className="rounded-[10px] border border-white/[0.09] bg-[rgba(8,12,11,0.74)] p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] md:p-5">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-green)]">Inquiry customer</p>
                <h2 className="mt-1 text-[18px] font-semibold text-white">Butuh produk lain?</h2>
                <p className="mt-1 text-[13px] leading-5 text-white/50">
                  Buka katalog dan kirim inquiry baru dari halaman detail produk.
                </p>
              </div>
              <Link href="/products" className={`${primaryActionClass} w-full sm:w-auto`}>
                Lihat katalog
              </Link>
            </div>
          </div>
        )}

        {inquiries.map((inquiry) => (
          <article
            key={inquiry.id}
            className="grid gap-3 rounded-[10px] border border-white/[0.09] bg-[rgba(8,12,11,0.74)] p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition-colors hover:border-white/[0.15] hover:bg-[rgba(10,16,14,0.82)] md:grid-cols-[128px_minmax(0,1fr)_minmax(150px,auto)] md:items-center md:p-5"
          >
            <div className="flex items-center justify-between gap-3 md:block">
              <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${getStatusColor(inquiry.status)}`}>
                {getStatusLabel(inquiry.status)}
              </span>
              <p className="text-[11px] text-white/40 md:mt-2">
                {new Date(inquiry.createdAt).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="min-w-0">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <Link href={`/products/${inquiry.productId}`} className="group inline-flex max-w-full">
                    <h2 className="truncate text-[16px] font-semibold leading-tight text-white group-hover:text-[color:var(--brand-green)] md:text-[17px]">
                      {inquiry.product?.name ?? "Produk"}
                    </h2>
                  </Link>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-white/52">
                    {session?.user.role !== "CUSTOMER" && (
                      <span>
                        Customer <span className="font-medium text-white/75">{inquiry.user?.name ?? "-"}</span>
                      </span>
                    )}
                    <span>
                      Sales{" "}
                      {getSalesDisplayName(inquiry) !== "Belum ditugaskan" ? (
                        <span className="font-medium text-white/75">{getSalesDisplayName(inquiry)}</span>
                      ) : (
                        <span className="font-medium text-amber-200/90">
                          Belum ditugaskan
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {busyInquiryId === inquiry.id && (
                  <span className="shrink-0 rounded-full border border-[color:var(--brand-green)]/25 bg-[color:var(--brand-green)]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-green)]">
                    Menyimpan
                  </span>
                )}
              </div>

              <p className="mt-2 line-clamp-2 border-l border-white/[0.1] pl-3 text-[13px] leading-5 text-white/50">
                {inquiry.message ? inquiry.message : "Belum ada pesan tambahan pada inquiry ini."}
              </p>
            </div>

            <div className="flex flex-col gap-2 md:items-end">
              {session?.user.role === "ADMIN" && (
                <select
                  disabled={busyInquiryId === inquiry.id}
                  value={inquiry.assignedTo ?? ""}
                  onChange={(e) => assignSales(inquiry.id, e.target.value)}
                  className={`${selectControlClass} md:min-w-[180px]`}
                >
                  <option value="">Assign sales</option>
                  {salesUsers.map((sales) => (
                    <option key={sales.id} value={sales.id}>
                      {sales.name}
                    </option>
                  ))}
                </select>
              )}

              {session?.user.role === "SALES" && inquiry.assignedTo === session.user.id && (
                <div className="flex w-full items-center gap-2">
                  <select
                    disabled={busyInquiryId === inquiry.id}
                    value={inquiry.status}
                    onChange={(e) => updateStatus(inquiry.id, e.target.value)}
                    className={`${selectControlClass} flex-1`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="DIPROSES">Diproses</option>
                    <option value="SELESAI">Selesai</option>
                  </select>
                  <a href={getWhatsAppLink(inquiry)} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-[rgba(0,212,164,0.55)] bg-[color:var(--brand-green)] text-[#050706] shadow-[0_12px_30px_rgba(0,212,164,0.18)] transition-opacity hover:opacity-90" aria-label="Hubungi customer lewat WhatsApp">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </a>
                </div>
              )}

              {(session?.user.role === "CUSTOMER" || (session?.user.role === "SALES" && inquiry.assignedTo !== session.user.id)) && (
                <Link href={`/products/${inquiry.productId}`} className={`${secondaryActionClass} w-full md:w-auto`}>
                  Detail produk
                </Link>
              )}
            </div>
          </article>
        ))}

        {inquiries.length === 0 && (
          <div className="rounded-[10px] border border-white/[0.09] bg-[rgba(8,12,11,0.74)] p-6 text-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] md:p-7">
            <h2 className="text-[20px] font-semibold text-white">Belum ada inquiry</h2>
            <p className="mt-2 text-[14px] text-white/60">
              {session?.user.role === "CUSTOMER"
                ? "Inquiry yang Anda kirim dari detail produk akan muncul di sini."
                : "Inquiry baru akan muncul setelah customer mengirim pesan dari detail produk."}
            </p>
            {session?.user.role === "CUSTOMER" && (
              <Link href="/products" className={`${primaryActionClass} mt-5`}>
                Lihat produk
              </Link>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
