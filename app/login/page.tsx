"use client";

import BrandLogo from "@/components/BrandLogo";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isRegistered = searchParams.get("registered") === "true";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Email atau password salah");
        return;
      }
      router.replace("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page min-h-dvh bg-[color:var(--canvas-dark)] text-white">
      <section className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col justify-center px-6 py-8">
        <Link href="/" className="mb-10 flex justify-center text-white" aria-label="CV Banbuk Store home">
          <BrandLogo markClassName="h-12 w-12" textClassName="text-[18px]" subTextClassName="text-[9px]" />
        </Link>

        <h1 className="text-[32px] font-semibold leading-[1.12] tracking-[-0.04em]">Masuk ke CV Banbuk Store</h1>
        <p className="mt-2 text-[15px] text-white/62">
          Baru di sini?{" "}
          <Link href="/register" className="font-semibold text-[color:var(--brand-green)]">
            Buat akun →
          </Link>
        </p>

        {isRegistered && <p className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white/72">Akun berhasil dibuat. Silakan masuk.</p>}
        {error && <p className="mt-6 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-9 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Email</span>
            <input className="app-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@email.com" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Password</span>
            <input className="app-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required />
          </label>
          <button className="h-12 w-full rounded-xl bg-white text-sm font-semibold text-black disabled:opacity-45" disabled={loading}>
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>

        <p className="mt-8 text-sm leading-6 text-white/42">
          Masuk untuk mengelola pesanan, wishlist, inquiry, dan checkout CV Banbuk Store.
        </p>
      </section>
    </main>
  );
}
