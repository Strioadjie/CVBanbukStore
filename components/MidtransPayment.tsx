"use client";

import { useState, useEffect } from "react";

interface MidtransPaymentProps {
  productId: string;
  productName: string;
  price: number;
  onStatusChange?: (status: {
    tone: "success" | "info" | "error";
    title: string;
    message: string;
    redirectToDashboard?: boolean;
  }) => void;
}

declare global {
  interface Window {
    snap?: any;
  }
}

export default function MidtransPayment({ productId, productName, price, onStatusChange }: MidtransPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    if (!clientKey || clientKey === "your-client-key") {
      setIsConfigured(false);
    }
  }, []);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/payment/midtrans/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create transaction");
      }

      if (!window.snap) {
        const script = document.createElement("script");
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
        document.body.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      window.snap.pay(data.token, {
        onSuccess: function () {
          onStatusChange?.({
            tone: "success",
            title: "Pembayaran berhasil",
            message: "Pembayaran gateway sudah tercatat dan pesanan Anda akan segera diproses.",
            redirectToDashboard: true,
          });
        },
        onPending: function () {
          onStatusChange?.({
            tone: "info",
            title: "Pembayaran menunggu konfirmasi",
            message: "Transaksi Anda masih pending. Kami akan mengarahkan Anda ke akun untuk memantau statusnya.",
            redirectToDashboard: true,
          });
        },
        onError: function () {
          onStatusChange?.({
            tone: "error",
            title: "Pembayaran gagal",
            message: "Terjadi kendala saat memproses pembayaran gateway. Silakan coba lagi.",
          });
          setLoading(false);
        },
        onClose: function () {
          setLoading(false);
        },
      });
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
      setLoading(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="glass-panel border border-white/6 bg-[#141416]/50 p-5 sm:p-6">
        <h3 className="text-xl font-semibold text-slate-50">Midtrans belum dikonfigurasi</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Isi `MIDTRANS_SERVER_KEY` dan `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` pada `.env`, lalu restart aplikasi untuk mengaktifkan metode ini.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel border border-white/6 bg-[#141416]/50 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-50">Gateway payment</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Lanjutkan pembayaran dengan alur yang sudah familiar dan metode yang umum digunakan.
          </p>
        </div>
        <span className="status-pill bg-emerald-500/15 text-emerald-300">Midtrans</span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
        <div className="rounded-[22px] border border-white/8 bg-slate-950/45 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Produk</p>
          <p className="mt-1.5 text-base font-semibold text-slate-50">{productName}</p>
        </div>
        <div className="rounded-[22px] border border-[color:var(--primary)]/15 bg-[color:var(--primary)]/6 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Harga</p>
          <p className="mt-1.5 text-lg font-semibold text-[color:var(--primary)]">
            Rp {price.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-[22px] border border-white/8 bg-slate-950/35 px-4 py-4 text-sm leading-6 text-slate-300">
        Metode yang umumnya tersedia: transfer bank, kartu, e-wallet, QRIS, dan channel retail sesuai konfigurasi Midtrans Anda.
      </div>

      {error && (
        <div className="mt-4 rounded-[22px] border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <button onClick={handlePayment} disabled={loading} className="app-button-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
        {loading ? "Membuka popup pembayaran..." : "Bayar"}
      </button>
    </div>
  );
}
