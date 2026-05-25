"use client";

import { useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AppNavbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = useMemo(() => {
    const baseLinks = [
      { href: "/", label: "Home" },
      { href: "/products", label: "Store" },
    ];

    if (!session) return baseLinks;

    baseLinks.push({
      href: "/dashboard",
      label: session.user.role === "CUSTOMER" ? "Akun" : "Dashboard",
    });

    if (session.user.role === "CUSTOMER") {
      baseLinks.push({ href: "/wishlist", label: "Wishlist" });
    }

    if (session.user.role === "ADMIN" || session.user.role === "SALES") {
      baseLinks.push({ href: "/inquiry", label: "Inquiry" });
    }

    return baseLinks;
  }, [session]);

  const sectionName = useMemo(() => {
    if (pathname.startsWith("/products")) return "Store";
    if (pathname.startsWith("/dashboard")) return session?.user.role === "CUSTOMER" ? "Akun" : "Dashboard";
    if (pathname.startsWith("/wishlist")) return "Wishlist";
    if (pathname.startsWith("/inquiry")) return "Inquiry";
    if (pathname.startsWith("/login")) return "Login";
    if (pathname.startsWith("/register")) return "Register";
    return "CV Banbuk";
  }, [pathname, session?.user.role]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-[80]">
      <nav className="apple-global-nav flex items-center">
        <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link
            href={session ? "/dashboard" : "/"}
            className="flex h-full items-center gap-2 text-white"
            onClick={() => setMenuOpen(false)}
            aria-label="CV Banbuk Mandiri Jaya"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <path d="M3.3 7 12 12l8.7-5" />
              <path d="M12 22V12" />
            </svg>
            <span className="hidden sm:inline">Banbuk</span>
          </Link>

          <div className="hidden h-full items-center gap-7 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex h-full items-center text-white/78 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex h-full items-center gap-4">
            {session ? (
              <>
                <span className="hidden max-w-[180px] truncate text-white/72 lg:inline">
                  {session.user.name}
                </span>
                <button type="button" onClick={handleLogout} className="text-white/78 hover:text-white">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="text-white/78 hover:text-white">
                Login
              </Link>
            )}

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center text-white md:hidden"
              aria-expanded={menuOpen}
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((value) => !value)}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                {menuOpen ? (
                  <>
                    <path d="M6 6l12 12" />
                    <path d="M18 6 6 18" />
                  </>
                ) : (
                  <>
                    <path d="M5 8h14" />
                    <path d="M5 16h14" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div className="apple-sub-nav flex items-center">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-5 py-2 sm:px-6 lg:px-8">
          <Link href="/" className="text-[21px] font-semibold leading-[1.19] tracking-[0.231px] text-[color:var(--ink)]">
            {sectionName}
          </Link>

          <div className="hidden items-center gap-5 text-[14px] leading-[1.29] tracking-[-0.224px] text-[color:var(--ink-muted-80)] sm:flex">
            <Link href="/products" className="hover:text-[color:var(--primary)]">
              Katalog
            </Link>
            {session?.user.role === "ADMIN" && (
              <Link href="/products/add" className="hover:text-[color:var(--primary)]">
                Tambah
              </Link>
            )}
            {session && (
              <Link href="/dashboard" className="hover:text-[color:var(--primary)]">
                Ringkasan
              </Link>
            )}
          </div>

          <Link
            href={session ? "/products" : "/register"}
            className="app-button-primary min-h-0 px-4 py-2 text-[14px] leading-[1.29] tracking-[-0.224px]"
          >
            {session ? "Belanja" : "Mulai"}
          </Link>
        </div>
      </div>

      {menuOpen && (
        <div className="border-b border-[color:var(--hairline)] bg-[color:var(--canvas-parchment)] px-5 py-4 md:hidden">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-2 py-3 text-[17px] text-[color:var(--ink)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
