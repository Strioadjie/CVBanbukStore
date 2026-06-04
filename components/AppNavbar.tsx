"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import CartDrawer from "@/components/CartDrawer";

type LandingNavTone = "top" | "scrolled" | "solid";

const landingToneClass: Record<LandingNavTone, string> = {
  top: "landing-nav-top",
  scrolled: "landing-nav-scrolled",
  solid: "landing-nav-solid",
};

export default function AppNavbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [landingTone, setLandingTone] = useState<LandingNavTone>("top");
  const isLanding = pathname === "/";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isLanding) {
      setLandingTone("solid");
      return;
    }

    const updateTone = () => {
      if (window.scrollY < 28) {
        setLandingTone("top");
        return;
      }

      const probeY = Math.min(window.innerHeight - 1, 112);
      let node = document.elementFromPoint(window.innerWidth / 2, probeY) as HTMLElement | null;

      while (node && node !== document.body) {
        if (node.dataset.navSurface === "solid") {
          setLandingTone("solid");
          return;
        }
        node = node.parentElement;
      }

      setLandingTone("scrolled");
    };

    updateTone();
    window.addEventListener("scroll", updateTone, { passive: true });
    window.addEventListener("resize", updateTone);

    return () => {
      window.removeEventListener("scroll", updateTone);
      window.removeEventListener("resize", updateTone);
    };
  }, [isLanding]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const openCart = () => {
    window.dispatchEvent(new Event("banbuk-cart-open"));
  };

  const links = [
    { href: "/products", label: "Katalog" },
    { href: "/products/compare", label: "Bandingkan" },
    { href: session ? "/wishlist" : "/login", label: "Wishlist" },
    { href: session ? "/inquiry" : "/login", label: "Inquiry" },
    { href: session ? "/dashboard" : "/login", label: "Dashboard" },
  ];

  const isActive = (href: string) => {
    if (href === "/products") return pathname === "/products" || (pathname.startsWith("/products/") && !pathname.startsWith("/products/compare"));
    return pathname === href;
  };

  const headerClassName = isLanding ? "fixed inset-x-0 top-0 z-50" : "sticky top-0 z-50";
  const navClassName = isLanding
    ? `mint-nav landing-nav ${landingToneClass[landingTone]}`
    : "mint-nav border-b border-white/10 bg-[rgba(5,7,6,0.78)] backdrop-blur-xl";
  const showCart = !isLanding;

  return (
    <header className={headerClassName}>
      <nav className={navClassName}>
        <div className="content-wrap flex h-full items-center justify-between">
          <Link href="/" className="flex items-center text-white" aria-label="CV Banbuk Store home">
            <BrandLogo markClassName="h-8 w-8" textClassName="text-[17px]" compact />
          </Link>
          <div className="hidden items-center gap-7 text-[14px] font-medium text-white/68 md:flex">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={isActive(link.href) ? "text-white" : "hover:text-white"}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <button onClick={handleLogout} className="mint-pill mint-pill-outline hidden md:inline-flex">
                Keluar
              </button>
            ) : (
              <Link href="/login" className="hidden text-white/72 md:inline">
                Masuk
              </Link>
            )}
            {!session && (
              <Link href="/register" className="mint-pill mint-pill-light hidden sm:inline-flex">
                {isLanding ? "Buat akun" : "Daftar"}
              </Link>
            )}
            {showCart && (
              <button type="button" onClick={openCart} className="mint-pill mint-pill-green">
                Keranjang
              </button>
            )}
            <button type="button" className="text-[14px] font-medium text-white md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
              Menu
            </button>
          </div>
        </div>
      </nav>
      {open && (
        <div className={`${isLanding ? "landing-mobile-menu" : "bg-[#050706]"} border-b border-white/10 px-4 pb-4 text-white md:hidden`}>
          {links.map((link) => (
            <Link key={link.label} href={link.href} onClick={() => setOpen(false)} className="block py-3 font-medium">
              {link.label}
            </Link>
          ))}
        </div>
      )}
      {showCart && <CartDrawer />}
    </header>
  );
}
