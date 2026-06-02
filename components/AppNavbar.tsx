"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import CartDrawer from "@/components/CartDrawer";

export default function AppNavbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const openCart = () => {
    window.dispatchEvent(new Event("banbuk-cart-open"));
  };

  const links = [
    { href: "/products", label: "Store" },
    { href: "/products/compare", label: "Compare" },
    { href: session ? "/wishlist" : "/login", label: "Wishlist" },
    { href: session ? "/inquiry" : "/login", label: "Inquiry" },
    { href: session ? "/dashboard" : "/login", label: "Dashboard" },
  ];

  const isActive = (href: string, label: string) => {
    if (label === "Store") return pathname === "/products" || (pathname.startsWith("/products/") && !pathname.startsWith("/products/compare"));
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-50">
      <nav className="mint-nav border-b border-white/10 bg-[rgba(5,7,6,0.78)] backdrop-blur-xl">
        <div className="content-wrap flex h-full items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[17px] font-semibold text-white">
            <span className="h-5 w-5 rounded-full bg-[color:var(--brand-green)]" />
            BanbukStore
          </Link>
          <div className="hidden items-center gap-7 text-[14px] font-medium text-white/68 md:flex">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={isActive(link.href, link.label) ? "text-white" : "hover:text-white"}
              >
                {link.label}
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
            {!session && (
              <Link href="/register" className="mint-pill mint-pill-light hidden sm:inline-flex">
                Create account
              </Link>
            )}
            <button type="button" onClick={openCart} className="mint-pill mint-pill-green">
              Cart
            </button>
            <button type="button" className="text-[14px] font-medium text-white md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
              Menu
            </button>
          </div>
        </div>
      </nav>
      {open && (
        <div className="border-b border-white/10 bg-[#050706] px-4 pb-4 text-white md:hidden">
          {links.map((link) => (
            <Link key={link.label} href={link.href} onClick={() => setOpen(false)} className="block py-3 font-medium">
              {link.label}
            </Link>
          ))}
        </div>
      )}
      <CartDrawer />
    </header>
  );
}
