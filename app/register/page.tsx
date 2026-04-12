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
    <main className="page-shell flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[36px] border border-white/10 bg-[rgba(12,12,16,0.84)] shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:grid-cols-[0.96fr_1.04fr]">
        <div className="hidden bg-[linear-gradient(180deg,#101014,#18181f)] px-10 py-12 text-white lg:block">
          <p className="text-sm uppercase tracking-[0.3em] text-white/55">Customer access</p>
          <h1 className="mt-5 text-5xl font-semibold leading-tight">
            Buat akun untuk mulai menjelajahi katalog Banbuk.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/74">
            Registrasi memberi akses ke wishlist, inquiry, dan pembayaran dalam pengalaman yang dirancang agar tetap sederhana dan mudah dipahami.
          </p>

          <div className="mt-10 space-y-4">
            {[
              "Lihat katalog produk secara rapi dan responsif",
              "Tambahkan item ke wishlist untuk follow-up cepat",
              "Kirim inquiry dan lanjut ke pembayaran sesuai kebutuhan",
            ].map((item) => (
              <div key={item} className="rounded-[22px] bg-white/10 px-5 py-4 text-sm text-white/80">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-sm text-white/70">
            Akses customer dibuat cepat agar proses melihat produk hingga pembayaran terasa lebih lancar.
          </div>
        </div>

        <div className="bg-[rgba(12,12,16,0.82)] p-8 sm:p-10">
          <p className="section-kicker">Create account</p>
          <h1 className="text-5xl font-semibold text-slate-100">Buat akun baru</h1>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Registrasi sebagai customer untuk mulai menyimpan wishlist dan mengirim inquiry produk.
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="app-input"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="app-input"
                placeholder="Minimal 6 karakter"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Konfirmasi Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="app-input"
                placeholder="Ulangi password"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="app-button-primary w-full">
              {loading ? "Mendaftarkan..." : "Register"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-semibold text-[color:var(--primary)] hover:text-[color:var(--primary-deep)]">
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
