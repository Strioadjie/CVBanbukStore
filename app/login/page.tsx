"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <main className="page-shell flex min-h-screen items-center justify-center px-4 py-6">
      <div className="w-full max-w-xl overflow-hidden rounded-[30px] border border-white/10 bg-[rgba(12,12,16,0.84)] shadow-[0_22px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl">
        <div className="bg-[rgba(12,12,16,0.82)] p-6 sm:p-7">
          <p className="section-kicker">Authentication</p>
          <h1 className="text-4xl font-semibold text-slate-100">Masuk ke akun Anda</h1>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Akses dashboard sesuai role untuk mengelola produk, inquiry, wishlist, dan pembayaran.
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="app-input"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="app-input"
                placeholder="Masukkan password"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="app-button-primary w-full">
              {loading ? "Memproses..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Belum punya akun?{" "}
            <Link href="/register" className="font-semibold text-[color:var(--primary)] hover:text-[color:var(--primary-deep)]">
              Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
