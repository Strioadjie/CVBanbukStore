"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function AppNavbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const seedMode = pathname.startsWith("/products") || pathname.startsWith("/cart");

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const links = [
    { href: "/products", label: seedMode ? "Shop" : "Store" },
    { href: "/products/compare", label: seedMode ? "Science" : "Compare" },
    { href: session ? "/dashboard" : "/register", label: seedMode ? "Learn" : "Dashboard" },
  ];

  if (seedMode) {
    return (
      <header className="sticky top-0 z-50">
        <nav className="seed-nav bg-[rgba(17,63,18,0.92)] backdrop-blur-xl">
          <div className="content-wrap flex h-full items-center justify-between">
            <Link href="/" className="flex items-center gap-1 text-[28px] font-semibold tracking-[-0.04em]">
              Seed<span className="h-4 w-4 rounded-full bg-[color:var(--seed-cream)]" />
            </Link>
            <div className="hidden items-center gap-10 text-[14px] font-semibold md:flex">
              {links.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {session ? (
                <button onClick={handleLogout} className="hidden text-[14px] font-semibold md:inline">
                  Logout
                </button>
              ) : (
                <Link href="/login" className="hidden text-[14px] font-semibold md:inline">
                  Sign in
                </Link>
              )}
              <Link href="/cart" className="rounded-full bg-[color:var(--seed-cream)] px-5 py-3 text-[14px] font-bold text-[color:var(--seed-green)]">
                Cart
              </Link>
              <button className="md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
                Menu
              </button>
            </div>
          </div>
        </nav>
        {open && (
          <div className="bg-[color:var(--seed-green)] px-4 pb-4 text-[color:var(--seed-cream)] md:hidden">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="block py-3 font-semibold">
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50">
      <nav className="mint-nav bg-[rgba(5,7,6,0.72)] backdrop-blur-xl">
        <div className="content-wrap flex h-full items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-white">
            <span className="h-5 w-5 rounded-full bg-[color:var(--brand-green)]" />
            mintlify
          </Link>
          <div className="hidden items-center gap-7 text-white/72 md:flex">
            {["Resources", "Documentation", "Customers", "Blog", "Pricing"].map((item) => (
              <Link key={item} href={item === "Documentation" ? "/products" : "#"}>
                {item}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <button onClick={handleLogout} className="mint-pill mint-pill-outline hidden md:inline-flex">
                Logout
              </button>
            ) : (
              <Link href="/login" className="hidden text-white/72 md:inline">
                Sign in
              </Link>
            )}
            <Link href={session ? "/products" : "/register"} className="mint-pill mint-pill-light">
              {session ? "Open store" : "Start for free"}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
