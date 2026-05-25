"use client";

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
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[color:var(--canvas-dark)] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col justify-center px-6 py-12">
        <Link href="/" className="mb-20 flex justify-center" aria-label="Home">
          <span className="relative h-12 w-12 rounded-[14px] bg-[color:var(--brand-green)]">
            <span className="absolute bottom-1 left-1 h-7 w-7 rounded-full bg-[color:var(--canvas-dark)]" />
          </span>
        </Link>

        <h1 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.04em]">Sign in to Mintlify</h1>
        <p className="mt-3 text-[22px] text-white/70">
          New here?{" "}
          <Link href="/register" className="font-semibold text-[color:var(--brand-green)]">
            Create account →
          </Link>
        </p>

        {isRegistered && <p className="mt-8 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-white/72">Akun berhasil dibuat. Silakan masuk.</p>}
        {error && <p className="mt-8 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-red-100">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-16 space-y-7">
          <label className="block">
            <span className="mb-3 block text-[20px] font-semibold">Enter your email</span>
            <input className="app-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@email.com" required />
          </label>
          <label className="block">
            <span className="mb-3 block text-[20px] font-semibold">Password</span>
            <input className="app-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required />
          </label>
          <button className="h-16 w-full rounded-2xl bg-white text-[18px] font-semibold text-black disabled:opacity-45" disabled={loading}>
            {loading ? "Signing in..." : "Continue"}
          </button>
        </form>

        <div className="my-10 flex items-center gap-4 text-white/50">
          <span className="h-px flex-1 bg-white/20" />
          OR
          <span className="h-px flex-1 bg-white/20" />
        </div>

        <button className="h-16 rounded-2xl border border-white/20 text-[18px] font-semibold text-white">
          Continue with Google
        </button>

        <p className="mt-20 text-[20px] leading-8 text-white/50">
          By signing in, you agree to the <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>.
        </p>
      </section>
    </main>
  );
}
