"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface MidtransPaymentProps {
  productId: string;
  productName: string;
  price: number;
}

declare global {
  interface Window {
    snap?: any;
  }
}

export default function MidtransPayment({ productId, productName, price }: MidtransPaymentProps) {
  const router = useRouter();
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
          alert("Pembayaran berhasil!");
          router.push("/dashboard");
        },
        onPending: function () {
          alert("Menunggu pembayaran...");
          router.push("/dashboard");
        },
        onError: function () {
          alert("Pembayaran gagal!");
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
      <div className="glass-panel p-6">
        <h3 className="text-2xl font-semibold text-slate-50">Midtrans belum dikonfigurasi</h3>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Isi `MIDTRANS_SERVER_KEY` dan `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` pada `.env`, lalu restart aplikasi untuk mengaktifkan payment gateway.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-slate-50">Payment Gateway</h3>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Midtrans sandbox cocok untuk demo dengan alur pembayaran yang familiar.
          </p>
        </div>
        <span className="status-pill bg-emerald-500/15 text-emerald-300">Sandbox</span>
      </div>

      <div className="mt-5 rounded-[24px] bg-slate-950/55 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Produk</p>
        <p className="mt-2 text-lg font-semibold text-slate-50">{productName}</p>
        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Harga</p>
        <p className="mt-2 text-2xl font-semibold text-teal-300">Rp {price.toLocaleString("id-ID")}</p>
      </div>

      <div className="mt-5 rounded-[24px] bg-slate-950/40 px-5 py-4 text-sm leading-7 text-slate-300">
        Metode yang umumnya tersedia: transfer bank, kartu, e-wallet, QRIS, dan channel retail sesuai konfigurasi Midtrans Anda.
      </div>

      {error && (
        <div className="mt-5 rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <button onClick={handlePayment} disabled={loading} className="app-button-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60">
        {loading ? "Membuka popup pembayaran..." : "Bayar dengan Midtrans"}
      </button>
    </div>
  );
}
