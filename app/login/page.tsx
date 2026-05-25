"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AppNavbar from "@/components/AppNavbar";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isRegistered = searchParams.get("registered") === "true";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setError("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <AppNavbar />
      <section className="flex min-h-[calc(100svh-96px)] items-center justify-center bg-[color:var(--canvas-parchment)] px-5 py-16">
        <div className="w-full max-w-[520px] rounded-[18px] border border-[color:var(--hairline)] bg-white p-6 sm:p-8">
          <p className="section-kicker">Login</p>
          <h1 className="section-title">Masuk ke akun</h1>
          <p className="section-subtitle text-[17px] leading-[1.47] tracking-[-0.374px]">
            Lanjutkan ke dashboard, katalog, inquiry, dan pembayaran.
          </p>

          {isRegistered && !error && (
            <div className="mt-6 rounded-[18px] border border-[color:var(--hairline)] bg-[color:var(--canvas-parchment)] px-4 py-3 text-[14px] text-[color:var(--ink-muted-80)]">
              Akun berhasil dibuat. Silakan login.
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-[18px] border border-[color:var(--hairline)] bg-[color:var(--canvas-parchment)] px-4 py-3 text-[14px] text-[color:var(--ink)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-[14px] font-semibold leading-[1.29] tracking-[-0.224px] text-[color:var(--ink)]">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="app-input"
                placeholder="email@example.com"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[14px] font-semibold leading-[1.29] tracking-[-0.224px] text-[color:var(--ink)]">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="app-input"
                placeholder="Masukkan password"
                required
              />
            </label>

            <button type="submit" disabled={loading} className="app-button-primary w-full">
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="mt-6 text-center text-[14px] leading-[1.43] tracking-[-0.224px] text-[color:var(--ink-muted-80)]">
            Belum punya akun?{" "}
            <Link href="/register" className="text-[color:var(--primary)]">
              Buat akun
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
