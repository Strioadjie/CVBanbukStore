"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import AppNavbar from "@/components/AppNavbar";
import Web3Payment from "@/components/Web3Payment";
import MidtransPayment from "@/components/MidtransPayment";
import ProductImage from "@/components/ProductImage";
import InteractiveCard from "@/components/InteractiveCard";

export default function PaymentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentType, setPaymentType] = useState<"MIDTRANS" | "CRYPTO" | "REGULAR">("MIDTRANS");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegularPayment = async () => {
    try {
      const res = await fetch("/api/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          amount: product.price,
          paymentType: "REGULAR",
        }),
      });

      if (res.ok) {
        alert("Pembayaran berhasil!");
        router.push("/dashboard");
      } else {
        alert("Pembayaran gagal");
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  const handleCryptoSuccess = async (txHash: string, walletAddress: string) => {
    try {
      const res = await fetch("/api/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          amount: product.price,
          paymentType: "CRYPTO",
          txHash,
          walletAddress,
        }),
      });

      if (res.ok) {
        alert("Pembayaran crypto berhasil!");
        router.push("/dashboard");
      }
    } catch (error) {
      alert("Gagal menyimpan transaksi");
    }
  };

  if (loading) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="glass-panel px-8 py-6 text-sm text-slate-300">Memuat halaman pembayaran...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="glass-panel px-8 py-6 text-sm text-slate-300">Produk tidak ditemukan.</div>
      </div>
    );
  }

  return (
    <main className="page-shell pb-16">
      <AppNavbar />

      <section className="content-wrap pt-8">
        <div className="glass-panel px-6 py-8 sm:px-8 sm:py-10">
          <span className="section-kicker">Checkout</span>
          <h1 className="section-title">Pembayaran produk</h1>
          <p className="section-subtitle">
            Pilih metode pembayaran yang paling sesuai. Flow manual, gateway, dan crypto tetap dipertahankan, hanya tampilannya dibuat lebih rapi.
          </p>
        </div>
      </section>

      <section className="content-wrap mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <InteractiveCard className="glass-panel overflow-hidden">
          <div className="relative h-56 overflow-hidden">
            <ProductImage src={product.image} alt={product.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <span className="status-pill w-fit bg-white/15 text-white">Detail produk</span>
              <div className="mt-4">
                <h2 className="text-4xl font-semibold">{product.name}</h2>
                <p className="mt-3 max-w-md text-sm leading-7 text-white/75">{product.description}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-950/55 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Bahan</p>
                <p className="mt-2 text-sm font-semibold text-slate-100">{product.material}</p>
              </div>
              <div className="rounded-2xl bg-slate-950/55 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Ukuran</p>
                <p className="mt-2 text-sm font-semibold text-slate-100">{product.size}</p>
              </div>
              <div className="rounded-2xl bg-slate-950/55 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Stok</p>
                <p className="mt-2 text-sm font-semibold text-slate-100">{product.stock}</p>
              </div>
              <div className="rounded-2xl bg-slate-950/55 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Harga</p>
                <p className="mt-2 text-sm font-semibold text-teal-300">Rp {product.price.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </InteractiveCard>

        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h2 className="text-3xl font-semibold text-slate-50">Pilih metode pembayaran</h2>
            <div className="mt-5 grid gap-3">
              {[
                ["MIDTRANS", "Payment Gateway", "Bank transfer, e-wallet, QRIS, dan metode lain."],
                ["CRYPTO", "Crypto ETH", "MetaMask atau wallet testnet Ethereum Sepolia."],
                ["REGULAR", "Manual", "Simulasi pembayaran sederhana untuk demo cepat."],
              ].map(([type, title, helper]) => (
                <button
                  key={type}
                  onClick={() => setPaymentType(type as "MIDTRANS" | "CRYPTO" | "REGULAR")}
                  className={`rounded-[24px] border p-5 text-left ${paymentType === type ? "border-teal-400 bg-teal-500/10" : "border-slate-800 bg-slate-950/35"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-slate-50">{title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{helper}</p>
                    </div>
                    <span className={`status-pill ${paymentType === type ? "bg-teal-700 text-white" : "bg-slate-800 text-slate-300"}`}>
                      {paymentType === type ? "Aktif" : "Pilih"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {paymentType === "MIDTRANS" ? (
            <MidtransPayment productId={productId} productName={product.name} price={product.price} />
          ) : paymentType === "REGULAR" ? (
            <div className="glass-panel p-6">
              <h3 className="text-2xl font-semibold text-slate-50">Pembayaran manual</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Untuk demo lokal, gunakan tombol di bawah ini agar transaksi tersimpan langsung ke database.
              </p>
              <button onClick={handleRegularPayment} className="app-button-primary mt-6 w-full">
                Bayar Sekarang
              </button>
            </div>
          ) : (
            <Web3Payment
              productId={productId}
              productName={product.name}
              price={product.price}
              onSuccess={handleCryptoSuccess}
            />
          )}
        </div>
      </section>
    </main>
  );
}
