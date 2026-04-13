"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "CUSTOMER",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registrasi gagal");
      } else {
        router.push("/login?registered=true");
      }
    } catch (error) {
      setError("Terjadi kesalahan saat registrasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell flex h-[100svh] items-center justify-center overflow-hidden px-4 py-6 sm:px-6 sm:py-7">
      <section className="relative w-full max-w-sm overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(160deg,rgba(12,12,16,0.94),rgba(9,9,12,0.92))] px-4 py-3.5 shadow-[0_18px_44px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:px-5 sm:py-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,179,123,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_24%)]" />
        <div className="absolute left-5 top-0 h-px w-16 bg-[linear-gradient(90deg,rgba(220,179,123,0.84),transparent)]" />

        <div className="relative z-10 mx-auto w-full max-w-sm">
          <p className="section-kicker">Register</p>
          <h1 className="mt-2 text-[1.65rem] font-semibold leading-[0.98] text-slate-100 sm:text-[1.9rem]">
            Buat akun baru
          </h1>

          {error && (
            <div className="mt-3 rounded-[18px] border border-rose-400/18 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-3.5 space-y-2.5">
            <div className="rounded-[18px] border border-white/8 bg-white/[0.02] p-2">
              <label className="mb-1 block px-3 pt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Nama
              </label>
              <div className="flex items-center gap-2.5 rounded-[14px] border border-white/6 bg-black/20 px-3.5 py-2.25">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21a8 8 0 1 0-16 0" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-transparent text-[14px] text-slate-100 outline-none placeholder:text-slate-500"
                  placeholder="Nama lengkap"
                  required
                />
              </div>
            </div>

            <div className="rounded-[18px] border border-white/8 bg-white/[0.02] p-2">
              <label className="mb-1 block px-3 pt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Email
              </label>
              <div className="flex items-center gap-2.5 rounded-[14px] border border-white/6 bg-black/20 px-3.5 py-2.25">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16v12H4z" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              <div className="flex items-center gap-2.5 rounded-[14px] border border-white/6 bg-black/20 px-3.5 py-2.25">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="11" width="16" height="9" rx="2" />
                  <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                </svg>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-transparent text-[14px] text-slate-100 outline-none placeholder:text-slate-500"
                  placeholder="Minimal 6 karakter"
                  required
                />
              </div>
            </div>

            <div className="rounded-[18px] border border-white/8 bg-white/[0.02] p-2">
              <label className="mb-1 block px-3 pt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Konfirmasi
              </label>
              <div className="flex items-center gap-2.5 rounded-[14px] border border-white/6 bg-black/20 px-3.5 py-2.25">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 12 2 2 4-4" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full bg-transparent text-[14px] text-slate-100 outline-none placeholder:text-slate-500"
                  placeholder="Ulangi password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[linear-gradient(135deg,#e6bb7d,#b67a3f)] px-6 py-2.5 text-sm font-semibold text-[#17120f] shadow-[0_12px_26px_rgba(182,122,63,0.22)] transition-all hover:translate-y-[-1px] hover:shadow-[0_14px_30px_rgba(182,122,63,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Mendaftarkan..." : "Buat akun"}
            </button>
          </form>

          <p className="mt-3.5 text-center text-[13px] text-slate-500">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-[color:var(--primary)] transition-colors hover:text-[color:var(--primary-deep)]"
            >
              Login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
