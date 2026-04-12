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
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/60 bg-white/50 shadow-[0_30px_90px_rgba(15,23,42,0.14)] backdrop-blur-xl lg:grid-cols-[0.92fr_1.08fr]">
        <div className="hidden bg-[linear-gradient(180deg,#115e59,#1f2937)] px-10 py-12 text-white lg:block">
          <p className="text-sm uppercase tracking-[0.3em] text-white/55">Customer onboarding</p>
          <h1 className="mt-5 text-5xl font-semibold leading-tight">
            Daftar dan mulai simpan produk favorit Anda.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/74">
            Akun customer memberi akses ke wishlist, inquiry cart, dan pilihan pembayaran. Form tetap dibuat sederhana agar mudah dipahami pengguna baru.
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
        </div>

        <div className="bg-[rgba(255,253,248,0.9)] p-8 sm:p-10">
          <p className="section-kicker">Create account</p>
          <h1 className="text-4xl font-semibold text-slate-900">Buat akun baru</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Registrasi sebagai customer untuk mulai menyimpan wishlist dan mengirim inquiry produk.
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
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
              <label className="mb-2 block text-sm font-medium text-slate-700">
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
              <label className="mb-2 block text-sm font-medium text-slate-700">
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
              <label className="mb-2 block text-sm font-medium text-slate-700">
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

          <p className="mt-6 text-center text-sm text-slate-600">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-semibold text-teal-700 hover:text-teal-800">
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
