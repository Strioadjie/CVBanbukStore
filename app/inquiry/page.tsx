"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppNavbar from "@/components/AppNavbar";
import InteractiveCard from "@/components/InteractiveCard";
import Link from "next/link";

export default function InquiryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [salesUsers, setSalesUsers] = useState<any[]>([]);
  const [cartProducts, setCartProducts] = useState<any[]>([]);
  const [cartMessage, setCartMessage] = useState("");

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
      if (session.user.role === "CUSTOMER") {
        fetchCartProducts();
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

  const fetchCartProducts = async () => {
    const stored = localStorage.getItem("inquiry-cart");
    const productIds: string[] = stored ? JSON.parse(stored) : [];
    if (!productIds.length) {
      setCartProducts([]);
      return;
    }

    const res = await fetch("/api/products");
    const data = await res.json();
    setCartProducts(data.filter((product: any) => productIds.includes(product.id)));
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

  const removeFromCart = (productId: string) => {
    const nextProducts = cartProducts.filter((product) => product.id !== productId);
    setCartProducts(nextProducts);
    localStorage.setItem("inquiry-cart", JSON.stringify(nextProducts.map((product) => product.id)));
  };

  const submitInquiryCart = async () => {
    if (!cartProducts.length) return;

    try {
      for (const product of cartProducts) {
        await fetch("/api/inquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id, message: cartMessage }),
        });
      }

      localStorage.removeItem("inquiry-cart");
      setCartProducts([]);
      setCartMessage("");
      alert("Inquiry cart berhasil dikirim ke tim sales.");
      fetchInquiries();
    } catch (error) {
      alert("Gagal mengirim inquiry cart");
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
        return "bg-amber-50 text-amber-700";
      case "DIPROSES":
        return "bg-sky-50 text-sky-700";
      case "SELESAI":
        return "bg-emerald-50 text-emerald-700";
      default:
        return "bg-slate-100 text-slate-700";
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
            Semua inquiry ditampilkan lebih rapi agar admin mudah assign ke sales, dan sales bisa fokus update status serta follow-up customer.
          </p>
        </div>
      </section>

      <section className="content-wrap mt-8 space-y-5">
        {session?.user.role === "CUSTOMER" && (
          <InteractiveCard className="glass-panel p-6 sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="lg:max-w-2xl">
                <span className="section-kicker">Inquiry cart</span>
                <h2 className="text-3xl font-semibold text-slate-50">Keranjang permintaan</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Tambahkan produk dari katalog ke keranjang inquiry, lalu kirim sekaligus ke tim sales untuk penawaran.
                </p>
              </div>
              <div className="glass-card px-5 py-4 text-sm text-slate-300">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Item di cart</p>
                <p className="mt-2 text-2xl font-semibold text-slate-50">{cartProducts.length}</p>
              </div>
            </div>

            {cartProducts.length > 0 ? (
              <div className="mt-6 space-y-4">
                {cartProducts.map((product) => (
                  <div key={product.id} className="glass-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-50">{product.name}</p>
                      <p className="mt-1 text-sm text-slate-300">
                        {product.material} • {product.size} • Rp {product.price.toLocaleString()}
                      </p>
                    </div>
                    <button onClick={() => removeFromCart(product.id)} className="app-button-secondary">
                      Hapus
                    </button>
                  </div>
                ))}

                <textarea
                  value={cartMessage}
                  onChange={(e) => setCartMessage(e.target.value)}
                  className="app-input min-h-[110px]"
                  placeholder="Tambahkan catatan atau kebutuhan penawaran..."
                />

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button onClick={submitInquiryCart} className="app-button-primary">
                    Kirim Inquiry Cart
                  </button>
                  <Link href="/products" className="app-button-secondary">
                    Tambah Produk Lagi
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-[24px] bg-slate-950/45 px-5 py-4 text-sm leading-7 text-slate-300">
                Keranjang inquiry masih kosong. Tambahkan produk dari katalog dulu.
              </div>
            )}
          </InteractiveCard>
        )}

        {inquiries.map((inquiry) => (
          <InteractiveCard key={inquiry.id} className="glass-panel p-6 sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className={`status-pill ${getStatusColor(inquiry.status)}`}>
                  {inquiry.status}
                </div>
                <h2 className="mt-4 text-3xl font-semibold text-slate-50">{inquiry.product?.name}</h2>
                <div className="mt-3 space-y-1 text-sm text-slate-300">
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
              <div className="mt-5 rounded-[24px] bg-slate-950/45 px-5 py-4 text-sm leading-7 text-slate-300">
                {inquiry.message}
              </div>
            )}
          </InteractiveCard>
        ))}

        {inquiries.length === 0 && (
          <div className="empty-state text-slate-300">Belum ada inquiry yang masuk.</div>
        )}
      </section>
    </main>
  );
}
