"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppNavbar from "@/components/AppNavbar";
import InteractiveCard from "@/components/InteractiveCard";

type InquiryNotice = {
  id: number;
  tone: "success" | "info" | "error";
  title: string;
  message: string;
};

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
        return "bg-white/5 border border-white/10 text-slate-300";
      case "DIPROSES":
        return "bg-[color:var(--primary)]/10 border border-[color:var(--primary)]/20 text-[color:var(--primary)]";
      case "SELESAI":
        return "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300";
      default:
        return "bg-white/5 border border-white/10 text-slate-300";
    }
  };

  if (loading) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="glass-panel px-8 py-6 text-sm text-slate-300">Memuat data inquiry...</div>
      </div>
    );
  }

  return (
    <main className="page-shell pb-16">
      <AppNavbar />

      {inquiryNotice && (
        <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[130] flex justify-center sm:inset-x-auto sm:right-6 sm:w-auto sm:justify-end">
          <div
            key={inquiryNotice.id}
            className={`pointer-events-auto w-full max-w-[400px] rounded-[26px] border px-5 py-4 shadow-[0_28px_70px_rgba(0,0,0,0.35)] ${
              inquiryNotice.tone === "success"
                ? "border-emerald-400/20 bg-[linear-gradient(135deg,rgba(16,40,28,0.97),rgba(11,18,15,0.98))]"
                : inquiryNotice.tone === "info"
                  ? "border-sky-400/20 bg-[linear-gradient(135deg,rgba(15,34,48,0.97),rgba(10,16,22,0.98))]"
                  : "border-rose-400/20 bg-[linear-gradient(135deg,rgba(52,20,24,0.97),rgba(18,12,14,0.98))]"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
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

      <section className="content-wrap pt-8">
        <div className="glass-panel px-6 py-6 sm:px-8 border border-white/5 bg-[#141416]/50">
          <span className="section-kicker">Inquiry workflow</span>
          <h1 className="mt-2 text-2xl font-medium tracking-tight text-slate-50">Inquiry management</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Semua inquiry ditampilkan lebih ringkas agar admin mudah assign, sales cepat follow-up, dan customer cukup memantau statusnya.
          </p>
        </div>
      </section>

      <section className="content-wrap mt-8 space-y-5">
        {session?.user.role === "CUSTOMER" && (
          <div className="glass-panel px-6 py-5 sm:px-8 border border-[color:var(--primary)]/10 bg-[#141416]/50">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-[color:var(--primary)]">Customer inquiry</p>
                <h2 className="mt-1 text-xl font-medium text-slate-100">Riwayat inquiry Anda</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
                  Pantau progres inquiry Anda dengan mudah langsung dari halaman ini.
                </p>
              </div>
              <Link href="/products" className="app-button-secondary py-2 text-xs">
                Lihat Katalog Produk
              </Link>
            </div>
          </div>
        )}

        {inquiries.map((inquiry) => (
          <InteractiveCard key={inquiry.id} className="glass-panel p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 border border-white/5 bg-[#141416]/40 hover:bg-[#141416]/60 transition-colors">
            
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 flex-1 min-w-0">
              <div className="flex flex-col items-start gap-1.5 w-32 shrink-0">
                <span className={`text-[9px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase ${getStatusColor(inquiry.status)}`}>
                  {inquiry.status}
                </span>
                <p className="text-[11px] text-slate-500 whitespace-nowrap">{new Date(inquiry.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute:"2-digit" })}</p>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-[17px] font-medium tracking-tight text-slate-100 truncate">{inquiry.product?.name}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
                  <p className="text-slate-300"><span className="text-slate-500">Cust:</span> <span className="font-medium text-slate-200">{inquiry.user?.name}</span></p>
                  <p className="text-slate-300"><span className="text-slate-500">Sales:</span> {inquiry.sales?.name || <span className="text-rose-400/80 italic">Unassigned</span>}</p>
                </div>
                {inquiry.message && <p className="mt-2 text-[12px] text-slate-500 italic line-clamp-1 border-l-2 border-white/10 pl-2">"{inquiry.message}"</p>}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 lg:w-48 justify-end">
              {session?.user.role === "ADMIN" && !inquiry.assignedTo && (
                <select
                  disabled={busyInquiryId === inquiry.id}
                  onChange={(e) => assignSales(inquiry.id, e.target.value)}
                  className="app-input py-1.5 px-3 text-[11px] bg-white/5 border border-white/10 rounded-lg w-full text-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">+ Assign Sales</option>
                  {salesUsers.map((sales) => (
                    <option key={sales.id} value={sales.id} className="bg-slate-900">
                      {sales.name}
                    </option>
                  ))}
                </select>
              )}

              {session?.user.role === "SALES" && inquiry.assignedTo === session.user.id && (
                <div className="flex items-center gap-2 w-full">
                  <select
                    disabled={busyInquiryId === inquiry.id}
                    value={inquiry.status}
                    onChange={(e) => updateStatus(inquiry.id, e.target.value)}
                    className="app-input py-1.5 px-2 text-[11px] bg-white/5 border border-white/10 rounded-lg flex-1 text-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="PENDING" className="bg-slate-900">Pending</option>
                    <option value="DIPROSES" className="bg-slate-900">Diproses</option>
                    <option value="SELESAI" className="bg-slate-900">Selesai</option>
                  </select>
                  <a href={getWhatsAppLink(inquiry)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-8 w-8 rounded-lg bg-[color:var(--primary)] text-[#101012] hover:opacity-90">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </a>
                </div>
              )}
            </div>
          </InteractiveCard>
        ))}

        {inquiries.length === 0 && (
          <div className="empty-state text-slate-400">Belum ada inquiry yang masuk.</div>
        )}
      </section>
    </main>
  );
}
