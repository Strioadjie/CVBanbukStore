"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20.5s-7-4.35-9-8.5C1.56 8.99 3.33 5.5 7 5.5c2.06 0 3.3 1.02 5 3 1.7-1.98 2.94-3 5-3 3.67 0 5.44 3.49 4 6.5-2 4.15-9 8.5-9 8.5Z"
      />
    </svg>
  );
}

export default function AppNavbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = useMemo(() => {
    if (!session) return [];

    const baseLinks = [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/products", label: "Produk" },
    ];

    if (session.user.role === "ADMIN" || session.user.role === "SALES") {
      baseLinks.push({ href: "/inquiry", label: "Inquiry" });
    }

    return baseLinks;
  }, [session]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const roleLabel = session?.user.role === "ADMIN"
    ? "Admin"
    : session?.user.role === "SALES"
      ? "Sales"
      : "Customer";

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-50">
        <div className="content-wrap pt-4">
          <div
            className={`glass-panel mx-auto transition-all duration-300 ${
              isScrolled
                ? "rounded-[22px] px-4 py-2 sm:px-5 shadow-[0_18px_40px_rgba(92,63,35,0.12)]"
                : "rounded-[28px] px-4 py-3 sm:px-6"
            }`}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center justify-between gap-4">
                <Link href={session ? "/dashboard" : "/"} className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center rounded-2xl bg-white text-sm font-bold text-black shadow-lg transition-all duration-300 ${
                      isScrolled ? "h-8 w-8" : "h-11 w-11"
                    }`}
                  >
                    BMJ
                  </div>
                  <div>
                    <p
                      className={`font-semibold text-slate-100 transition-all duration-300 ${
                        isScrolled ? "text-sm" : "text-base"
                      }`}
                    >
                      CV Banbuk Mandiri Jaya
                    </p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Katalog produk, inquiry, dan pembayaran
                    </p>
                  </div>
                </Link>

                <button
                  onClick={() => setMenuOpen((value) => !value)}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 lg:hidden"
                >
                  Menu
                </button>
              </div>

              <div
                className={`${
                  menuOpen ? "flex" : "hidden"
                } flex-col gap-4 lg:flex lg:flex-1 lg:flex-row lg:items-center lg:justify-between`}
              >
                <div className="flex flex-col gap-2 lg:ml-10 lg:flex-row lg:items-center">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {session ? (
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className={`rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-slate-400 transition-all duration-300 ${isScrolled ? "py-2" : "py-3"}`}>
                      <p className="font-semibold text-slate-100">{session.user.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="status-pill bg-white/10 text-slate-200">
                          {roleLabel}
                        </span>
                      </div>
                    </div>

                    {session.user.role === "CUSTOMER" && (
                      <div className="flex items-center gap-2">
                        <Link
                          href="/wishlist"
                          aria-label="Wishlist"
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:text-white"
                        >
                          <HeartIcon />
                        </Link>
                      </div>
                    )}

                    <button onClick={handleLogout} className="app-button-secondary">
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
                    <Link href="/login" className="app-button-secondary">
                      Login
                    </Link>
                    <Link href="/register" className="app-button-primary">
                      Mulai Sekarang
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className={`${isScrolled ? "h-24" : "h-28"} transition-all duration-300`} />
    </>
  );
}
