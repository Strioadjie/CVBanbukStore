"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="page-shell flex h-[100svh] items-center justify-center overflow-hidden px-4 py-3 sm:px-6">
      <section className="relative w-full max-w-sm overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(160deg,rgba(12,12,16,0.94),rgba(9,9,12,0.92))] px-4 py-4 shadow-[0_18px_44px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:px-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,179,123,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_24%)]" />
        <div className="absolute left-5 top-0 h-px w-16 bg-[linear-gradient(90deg,rgba(220,179,123,0.84),transparent)]" />

        <div className="relative z-10 mx-auto w-full max-w-sm">
          <p className="section-kicker">Login</p>
          <h1 className="mt-2 text-[1.75rem] font-semibold leading-[0.98] text-slate-100 sm:text-[2rem]">
            Selamat datang kembali
          </h1>

          {isRegistered && !error && (
            <div className="mt-3 rounded-[18px] border border-emerald-400/18 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-200">
              Akun berhasil dibuat. Sekarang Anda bisa login memakai email dan password yang baru.
            </div>
          )}

          {error && (
            <div className="mt-3 rounded-[18px] border border-rose-400/18 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div className="rounded-[18px] border border-white/8 bg-white/[0.02] p-2">
              <label className="mb-1 block px-3 pt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Email
              </label>
              <div className="flex items-center gap-2.5 rounded-[14px] border border-white/6 bg-black/20 px-3.5 py-2.5">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16v12H4z" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-[14px] text-slate-100 outline-none placeholder:text-slate-500"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div className="rounded-[18px] border border-white/8 bg-white/[0.02] p-2">
              <label className="mb-1 block px-3 pt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Password
              </label>
              <div className="flex items-center gap-2.5 rounded-[14px] border border-white/6 bg-black/20 px-3.5 py-2.5">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="11" width="16" height="9" rx="2" />
                  <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-[14px] text-slate-100 outline-none placeholder:text-slate-500"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 transition-colors hover:text-slate-200"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[linear-gradient(135deg,#e6bb7d,#b67a3f)] px-6 py-2.5 text-sm font-semibold text-[#17120f] shadow-[0_12px_26px_rgba(182,122,63,0.22)] transition-all hover:translate-y-[-1px] hover:shadow-[0_14px_30px_rgba(182,122,63,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk ke akun"}
            </button>
          </form>

          <p className="mt-4 text-center text-[13px] text-slate-500">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-[color:var(--primary)] transition-colors hover:text-[color:var(--primary-deep)]"
            >
              Buat akun
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
