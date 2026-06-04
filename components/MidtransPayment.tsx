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

const MIDTRANS_SCRIPT_SELECTOR = 'script[data-midtrans-snap="true"]';

export default function MidtransPayment({ productId, productName, price, onStatusChange }: MidtransPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isConfigured, setIsConfigured] = useState(true);
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
  const snapScriptUrl = isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

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

      const existingScript = document.querySelector<HTMLScriptElement>(MIDTRANS_SCRIPT_SELECTOR);
      const activeClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
      const shouldReloadScript =
        !existingScript ||
        existingScript.src !== snapScriptUrl ||
        existingScript.getAttribute("data-client-key") !== activeClientKey;

      if (shouldReloadScript) {
        if (existingScript) {
          existingScript.remove();
        }

        window.snap = undefined;

        const script = document.createElement("script");
        script.src = snapScriptUrl;
        script.setAttribute("data-client-key", activeClientKey);
        script.setAttribute("data-midtrans-snap", "true");
        document.body.appendChild(script);

        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Gagal memuat script Midtrans Snap"));
        });
      }

      if (!window.snap) {
        throw new Error("Snap Midtrans belum siap. Coba refresh halaman lalu ulangi pembayaran.");
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
      <div className="rounded-[10px] border border-white/[0.09] bg-[rgba(8,12,11,0.74)] p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] md:p-5">
        <h3 className="text-[18px] font-semibold text-white">Midtrans belum dikonfigurasi</h3>
        <p className="mt-2 text-[13px] leading-5 text-white/58">
          Isi `MIDTRANS_SERVER_KEY` dan `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` pada `.env`, lalu restart aplikasi untuk mengaktifkan metode ini.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[10px] border border-white/[0.09] bg-[rgba(8,12,11,0.74)] p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] md:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[18px] font-semibold text-white">Gateway payment</h3>
          <p className="mt-2 text-[13px] leading-5 text-white/58">
            Lanjutkan pembayaran dengan alur yang sudah familiar dan metode yang umum digunakan.
          </p>
        </div>
        <span className="status-pill bg-[rgba(0,212,164,0.12)] text-[color:var(--brand-green)]">Midtrans</span>
      </div>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_168px]">
        <div className="rounded-[8px] border border-white/[0.08] bg-white/[0.035] px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase text-white/38">Produk</p>
          <p className="mt-1 truncate text-[13px] font-semibold text-white">{productName}</p>
        </div>
        <div className="rounded-[8px] border border-[rgba(0,212,164,0.18)] bg-[rgba(0,212,164,0.055)] px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase text-white/38">Harga</p>
          <p className="mt-1 text-[14px] font-semibold text-[color:var(--brand-green)]">
            Rp {price.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-[8px] border border-white/[0.08] bg-white/[0.035] px-3 py-2.5 text-[13px] leading-5 text-white/58">
        Metode yang umumnya tersedia: transfer bank, kartu, e-wallet, QRIS, dan channel retail sesuai konfigurasi Midtrans Anda.
      </div>

      {!isProduction && (
        <div className="mt-3 rounded-[8px] border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-[13px] leading-5 text-amber-100">
          Anda sedang memakai Midtrans sandbox. Beberapa channel bisa sesekali tidak stabil saat testing, tetapi daftar metode pembayaran tidak dibatasi oleh aplikasi.
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-[8px] border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-[13px] text-red-200">
          {error}
        </div>
      )}

      <button onClick={handlePayment} disabled={loading} className="app-button-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
        {loading ? "Membuka popup pembayaran..." : "Bayar"}
      </button>
    </div>
  );
}
