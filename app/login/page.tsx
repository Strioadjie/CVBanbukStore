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
    <main className="page-shell flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/60 bg-white/50 shadow-[0_30px_90px_rgba(15,23,42,0.14)] backdrop-blur-xl lg:grid-cols-[1fr_0.95fr]">
        <div className="hidden bg-slate-900 px-10 py-12 text-white lg:block">
          <p className="text-sm uppercase tracking-[0.3em] text-white/55">Welcome back</p>
          <h1 className="mt-5 text-5xl font-semibold leading-tight">
            Login untuk masuk ke workspace Banbuk.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/72">
            Gunakan akun demo untuk mencoba alur admin, sales, dan customer. Tampilan baru dibuat lebih bersih agar dashboard terasa profesional namun tetap ringan untuk dipelajari.
          </p>

          <div className="mt-10 space-y-4">
            <div className="rounded-[24px] bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">Admin Demo</p>
              <p className="mt-2 text-lg font-semibold">admin@test.com</p>
              <p className="text-sm text-white/70">Password: admin123</p>
            </div>
            <div className="rounded-[24px] bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">Sales Demo</p>
              <p className="mt-2 text-lg font-semibold">sales@test.com</p>
              <p className="text-sm text-white/70">Password: sales123</p>
            </div>
            <div className="rounded-[24px] bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">Customer Demo</p>
              <p className="mt-2 text-lg font-semibold">customer@test.com</p>
              <p className="text-sm text-white/70">Password: customer123</p>
            </div>
          </div>
        </div>

        <div className="bg-[rgba(255,253,248,0.9)] p-8 sm:p-10">
          <p className="section-kicker">Authentication</p>
          <h1 className="text-4xl font-semibold text-slate-900">Masuk ke akun Anda</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Akses dashboard sesuai role untuk mengelola produk, inquiry, wishlist, dan pembayaran.
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
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
              <label className="mb-2 block text-sm font-medium text-slate-700">
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

          <p className="mt-6 text-center text-sm text-slate-600">
            Belum punya akun?{" "}
            <Link href="/register" className="font-semibold text-teal-700 hover:text-teal-800">
              Register
            </Link>
          </p>

          <div className="mt-8 rounded-[24px] border border-slate-200/80 bg-white/70 p-5 lg:hidden">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Demo Accounts</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>Admin: admin@test.com / admin123</p>
              <p>Sales: sales@test.com / sales123</p>
              <p>Customer: customer@test.com / customer123</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
