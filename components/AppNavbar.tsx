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
  const seedMode = pathname.startsWith("/products") || pathname.startsWith("/cart");

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
    { href: session ? "/dashboard" : "/register", label: "Dashboard" },
  ];

  if (seedMode) {
    return (
      <header className="sticky top-0 z-50">
        <nav className="product-nav border-b border-white/10 bg-[rgba(5,7,6,0.78)] backdrop-blur-xl">
          <div className="content-wrap flex h-full items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-[18px] font-semibold text-white">
              <span className="h-4 w-4 rounded-full bg-[color:var(--brand-green)]" />
              BanbukStore
            </Link>
            <div className="hidden items-center gap-8 text-[14px] font-medium text-white/68 md:flex">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className={pathname === link.href ? "text-white" : ""}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {session ? (
                <button onClick={handleLogout} className="hidden text-[14px] font-medium text-white/68 md:inline">
                  Logout
                </button>
              ) : (
                <Link href="/login" className="hidden text-[14px] font-medium text-white/68 md:inline">
                  Sign in
                </Link>
              )}
              <button type="button" onClick={openCart} className="mint-pill mint-pill-green">
                Cart
              </button>
              <button className="text-[14px] font-medium text-white md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
                Menu
              </button>
            </div>
          </div>
        </nav>
        {open && (
          <div className="border-b border-white/10 bg-[#050706] px-4 pb-4 text-white md:hidden">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="block py-3 font-medium">
                {link.label}
              </Link>
            ))}
          </div>
        )}
        <CartDrawer />
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50">
      <nav className="mint-nav bg-[rgba(5,7,6,0.72)] backdrop-blur-xl">
        <div className="content-wrap flex h-full items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-white">
            <span className="h-5 w-5 rounded-full bg-[color:var(--brand-green)]" />
            BanbukStore
          </Link>
          <div className="hidden items-center gap-7 text-white/72 md:flex">
            {["Store", "Compare", "Wishlist", "Inquiry", "Dashboard"].map((item) => (
              <Link
                key={item}
                href={
                  item === "Store"
                    ? "/products"
                    : item === "Compare"
                      ? "/products/compare"
                      : item === "Wishlist"
                        ? "/wishlist"
                        : item === "Inquiry"
                          ? "/inquiry"
                          : session
                            ? "/dashboard"
                            : "/login"
                }
              >
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
              {session ? "Open store" : "Create account"}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
