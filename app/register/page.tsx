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
    <main className="min-h-screen bg-[color:var(--canvas-dark)] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col justify-center px-6 py-12">
        <Link href="/" className="mb-16 flex justify-center" aria-label="Home">
          <span className="relative h-12 w-12 rounded-[14px] bg-[color:var(--brand-green)]">
            <span className="absolute bottom-1 left-1 h-7 w-7 rounded-full bg-[color:var(--canvas-dark)]" />
          </span>
        </Link>

        <h1 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.04em]">Get Started with Mintlify</h1>
        <p className="mt-3 text-[22px] text-white/70">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[color:var(--brand-green)]">
            Sign in →
          </Link>
        </p>

        {error && <p className="mt-8 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-red-100">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-14 space-y-6">
          <label className="block">
            <span className="mb-3 block text-[20px] font-semibold">Your name</span>
            <input className="app-input" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="Full name" required />
          </label>
          <label className="block">
            <span className="mb-3 block text-[20px] font-semibold">Enter your email</span>
            <input className="app-input" type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} placeholder="name@email.com" required />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="app-input" type="password" value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} placeholder="Password" required />
            <input className="app-input" type="password" value={formData.confirmPassword} onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })} placeholder="Confirm" required />
          </div>
          <button className="h-16 w-full rounded-2xl bg-white text-[18px] font-semibold text-black disabled:opacity-45" disabled={loading}>
            {loading ? "Creating..." : "Continue"}
          </button>
        </form>

        <div className="my-10 flex items-center gap-4 text-white/50">
          <span className="h-px flex-1 bg-white/20" />
          OR
          <span className="h-px flex-1 bg-white/20" />
        </div>
        <button className="h-16 rounded-2xl border border-white/20 text-[18px] font-semibold text-white">Continue with Google</button>
        <p className="mt-16 text-[20px] leading-8 text-white/50">
          By signing up, you agree to the <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>.
        </p>
      </section>
    </main>
  );
}
