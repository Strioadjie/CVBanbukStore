"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppNavbar from "@/components/AppNavbar";
import InteractiveCard from "@/components/InteractiveCard";

export default function InquiryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [salesUsers, setSalesUsers] = useState<any[]>([]);

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
    try {
      const res = await fetch(`/api/inquiry/${inquiryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: salesId }),
      });

      if (res.ok) {
        alert("Sales berhasil di-assign!");
        fetchInquiries();
      }
    } catch (error) {
      alert("Gagal assign sales");
    }
  };

  const updateStatus = async (inquiryId: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/inquiry/${inquiryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        alert("Status berhasil diupdate!");
        fetchInquiries();
      }
    } catch (error) {
      alert("Gagal update status");
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
        return "bg-white/10 text-white";
      case "DIPROSES":
        return "bg-sky-500/15 text-sky-200";
      case "SELESAI":
        return "bg-emerald-500/15 text-emerald-200";
      default:
        return "bg-white/10 text-slate-300";
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

      <section className="content-wrap pt-8">
        <div className="glass-panel px-6 py-8 sm:px-8 sm:py-10">
          <span className="section-kicker">Inquiry workflow</span>
          <h1 className="section-title">Inquiry management</h1>
          <p className="section-subtitle">
            Semua inquiry ditampilkan lebih ringkas agar admin mudah assign, sales cepat follow-up, dan customer cukup memantau statusnya.
          </p>
        </div>
      </section>

      <section className="content-wrap mt-8 space-y-5">
        {session?.user.role === "CUSTOMER" && (
          <div className="glass-panel px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <span className="section-kicker">Customer inquiry</span>
                <h2 className="text-3xl font-semibold text-slate-100">Riwayat inquiry Anda</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Inquiry sekarang dikirim langsung dari halaman produk tanpa keranjang, jadi halaman ini fokus ke riwayat dan progresnya.
                </p>
              </div>
              <Link href="/products" className="app-button-secondary">
                Lihat Produk
              </Link>
            </div>
          </div>
        )}

        {inquiries.map((inquiry) => (
          <InteractiveCard key={inquiry.id} className="glass-panel p-6 sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className={`status-pill ${getStatusColor(inquiry.status)}`}>
                  {inquiry.status}
                </div>
                <h2 className="mt-4 text-3xl font-semibold text-slate-100">{inquiry.product?.name}</h2>
                <div className="mt-3 space-y-1 text-sm text-slate-400">
                  <p>Customer: {inquiry.user?.name} ({inquiry.user?.email})</p>
                  <p>Sales: {inquiry.sales?.name || "Belum di-assign"}</p>
                  <p>Dibuat: {new Date(inquiry.createdAt).toLocaleString("id-ID")}</p>
                </div>
              </div>

              <div className="glass-card px-5 py-4 text-sm text-slate-300 lg:min-w-[280px]">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Tindakan</p>
                <div className="mt-4 space-y-3">
                  {session?.user.role === "ADMIN" && !inquiry.assignedTo && (
                    <select onChange={(e) => assignSales(inquiry.id, e.target.value)} className="app-input text-sm">
                      <option value="">Assign ke sales</option>
                      {salesUsers.map((sales) => (
                        <option key={sales.id} value={sales.id}>
                          {sales.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {session?.user.role === "SALES" && inquiry.assignedTo === session.user.id && (
                    <>
                      <select value={inquiry.status} onChange={(e) => updateStatus(inquiry.id, e.target.value)} className="app-input text-sm">
                        <option value="PENDING">Pending</option>
                        <option value="DIPROSES">Diproses</option>
                        <option value="SELESAI">Selesai</option>
                      </select>
                      <a href={getWhatsAppLink(inquiry)} target="_blank" rel="noopener noreferrer" className="app-button-primary w-full">
                        Hubungi via WhatsApp
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {inquiry.message && (
              <div className="mt-5 rounded-[24px] bg-white/4 px-5 py-4 text-sm leading-7 text-slate-400">
                {inquiry.message}
              </div>
            )}
          </InteractiveCard>
        ))}

        {inquiries.length === 0 && (
          <div className="empty-state text-slate-400">Belum ada inquiry yang masuk.</div>
        )}
      </section>
    </main>
  );
}
