"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password, role: "CUSTOMER" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registrasi gagal");
        return;
      }
      router.push("/login?registered=true");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page min-h-dvh bg-[color:var(--canvas-dark)] text-white">
      <section className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center px-6 py-8">
        <Link href="/" className="mb-8 flex justify-center" aria-label="Home">
          <span className="relative h-10 w-10 rounded-[12px] bg-[color:var(--brand-green)]">
            <span className="absolute bottom-1 left-1 h-6 w-6 rounded-full bg-[color:var(--canvas-dark)]" />
          </span>
        </Link>

        <h1 className="text-[32px] font-semibold leading-[1.12] tracking-[-0.04em]">Create BanbukStore account</h1>
        <p className="mt-2 text-[15px] text-white/62">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-[color:var(--brand-green)]">
            Masuk →
          </Link>
        </p>

        {error && <p className="mt-6 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Nama</span>
            <input className="app-input" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="Full name" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Email</span>
            <input className="app-input" type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} placeholder="name@email.com" required />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="app-input" type="password" value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} placeholder="Password" required />
            <input className="app-input" type="password" value={formData.confirmPassword} onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })} placeholder="Confirm" required />
          </div>
          <button className="h-12 w-full rounded-xl bg-white text-sm font-semibold text-black disabled:opacity-45" disabled={loading}>
            {loading ? "Membuat akun..." : "Buat akun"}
          </button>
        </form>

        <p className="mt-7 text-sm leading-6 text-white/42">
          Akun customer dipakai untuk wishlist, inquiry, dan riwayat checkout.
        </p>
      </section>
    </main>
  );
}
