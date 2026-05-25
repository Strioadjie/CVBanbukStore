"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppNavbar from "@/components/AppNavbar";

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
    <main className="page-shell">
      <AppNavbar />
      <section className="flex min-h-[calc(100svh-96px)] items-center justify-center bg-[color:var(--canvas-parchment)] px-5 py-16">
        <div className="w-full max-w-[560px] rounded-[18px] border border-[color:var(--hairline)] bg-white p-6 sm:p-8">
          <p className="section-kicker">Register</p>
          <h1 className="section-title">Buat akun baru</h1>
          <p className="section-subtitle text-[17px] leading-[1.47] tracking-[-0.374px]">
            Akun customer memberi akses ke wishlist, inquiry, dan checkout.
          </p>

          {error && (
            <div className="mt-6 rounded-[18px] border border-[color:var(--hairline)] bg-[color:var(--canvas-parchment)] px-4 py-3 text-[14px] text-[color:var(--ink)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-[14px] font-semibold leading-[1.29] tracking-[-0.224px] text-[color:var(--ink)]">Nama</span>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="app-input"
                placeholder="Nama lengkap"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[14px] font-semibold leading-[1.29] tracking-[-0.224px] text-[color:var(--ink)]">Email</span>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="app-input"
                placeholder="email@example.com"
                required
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[14px] font-semibold leading-[1.29] tracking-[-0.224px] text-[color:var(--ink)]">Password</span>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="app-input"
                  placeholder="Minimal 6 karakter"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[14px] font-semibold leading-[1.29] tracking-[-0.224px] text-[color:var(--ink)]">Konfirmasi</span>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="app-input"
                  placeholder="Ulangi password"
                  required
                />
              </label>
            </div>

            <button type="submit" disabled={loading} className="app-button-primary w-full">
              {loading ? "Mendaftarkan..." : "Buat akun"}
            </button>
          </form>

          <p className="mt-6 text-center text-[14px] leading-[1.43] tracking-[-0.224px] text-[color:var(--ink-muted-80)]">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-[color:var(--primary)]">
              Login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
