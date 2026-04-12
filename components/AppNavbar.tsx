"use client";

import { useMemo, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function AppNavbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const scrollTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const scrolledRef = useRef(false);
  const tickingRef = useRef(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          desktop: "(min-width: 1024px)",
          mobile: "(max-width: 1023px)",
        },
        (context) => {
          const { reduceMotion, desktop, mobile } = context.conditions ?? {};
          const isDesktop = Boolean(desktop && !mobile);
          const duration = reduceMotion ? 0 : 0.34;
          const animatedNodes = [
            navRef.current,
            panelRef.current,
            brandRef.current,
            linksRef.current,
            actionsRef.current,
            spacerRef.current,
          ].filter(Boolean);

          const buildTimeline = () => {
            const shellWidth = shellRef.current?.clientWidth ?? 0;
            const brandWidth = brandRef.current?.scrollWidth ?? 0;
            const logoWidth = logoRef.current?.getBoundingClientRect().width ?? 0;
            const linksWidth = linksRef.current?.scrollWidth ?? 0;
            const actionsWidth = actionsRef.current?.scrollWidth ?? 0;
            const expandedHeight = isDesktop ? 128 : 96;
            const collapsedHeight = isDesktop ? 92 : expandedHeight;
            const collapsedWidth = isDesktop
              ? Math.min(
                  shellWidth,
                  Math.max(420, Math.ceil(logoWidth + linksWidth + actionsWidth + 104))
                )
              : shellWidth;

            scrollTimelineRef.current?.kill();

            gsap.set(panelRef.current, {
              width: shellWidth,
              borderRadius: 24,
              "--nav-panel-bg": "var(--surface)",
              "--nav-panel-border": "rgba(255, 255, 255, 0.1)",
              "--nav-panel-shadow": "var(--shadow)",
            });
            if (isDesktop) {
              gsap.set(brandRef.current, {
                width: brandWidth,
                autoAlpha: 1,
                x: 0,
              });
              gsap.set(linksRef.current, {
                x: 0,
              });
              gsap.set(actionsRef.current, {
                x: 0,
              });
            }
            gsap.set(spacerRef.current, {
              height: expandedHeight,
            });

            scrollTimelineRef.current = gsap.timeline({
              paused: true,
              defaults: {
                duration,
                ease: "power2.out",
              },
              onStart: () => {
                gsap.set(animatedNodes, {
                  willChange: "transform, opacity",
                });
                gsap.set([panelRef.current, brandRef.current, spacerRef.current], {
                  willChange: "width, transform, opacity",
                });
              },
              onComplete: () => {
                gsap.set(animatedNodes, { clearProps: "willChange" });
              },
              onReverseComplete: () => {
                gsap.set(animatedNodes, { clearProps: "willChange" });
              },
            });

            scrollTimelineRef.current
              .to(
                navRef.current,
                {
                  y: isDesktop ? -8 : 0,
                },
                0
              )
              .to(
                panelRef.current,
                {
                  width: collapsedWidth,
                  borderRadius: isDesktop ? 999 : 24,
                  "--nav-panel-bg": isDesktop ? "rgba(16, 16, 18, 0.8)" : "var(--surface)",
                  "--nav-panel-border": isDesktop ? "rgba(220, 179, 123, 0.22)" : "rgba(255, 255, 255, 0.1)",
                  "--nav-panel-shadow": isDesktop ? "0 18px 42px rgba(6, 6, 8, 0.28)" : "var(--shadow)",
                },
                0
              )
              .to(
                logoRef.current,
                {
                  scale: isDesktop ? 0.92 : 1,
                  ease: "back.out(1.2)",
                },
                0
              )
              .to(
                spacerRef.current,
                {
                  height: collapsedHeight,
                },
                0
              );

            if (isDesktop) {
              scrollTimelineRef.current
                .to(
                  brandRef.current,
                  {
                    width: 0,
                    autoAlpha: 0,
                    x: -14,
                    ease: "back.out(1.04)",
                  },
                  0
                )
                .to(
                  linksRef.current,
                  {
                    x: -10,
                  },
                  0
                )
                .to(
                  actionsRef.current,
                  {
                    x: -4,
                  },
                  0
                );
            }

            scrollTimelineRef.current.progress(scrolledRef.current ? 1 : 0);
          };

          const syncScrollState = () => {
            tickingRef.current = false;

            const nextScrolled = window.scrollY > 12;
            if (nextScrolled === scrolledRef.current) {
              return;
            }

            scrolledRef.current = nextScrolled;
            if (nextScrolled) {
              scrollTimelineRef.current?.play();
              return;
            }

            scrollTimelineRef.current?.reverse();
          };

          const onScroll = () => {
            if (tickingRef.current) {
              return;
            }

            tickingRef.current = true;
            window.requestAnimationFrame(syncScrollState);
          };

          let resizeFrame = 0;
          const onResize = () => {
            if (resizeFrame) {
              window.cancelAnimationFrame(resizeFrame);
            }

            resizeFrame = window.requestAnimationFrame(() => {
              resizeFrame = 0;
              buildTimeline();
            });
          };

          buildTimeline();
          syncScrollState();
          window.addEventListener("scroll", onScroll, { passive: true });
          window.addEventListener("resize", onResize);

          return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
            if (resizeFrame) {
              window.cancelAnimationFrame(resizeFrame);
            }
            scrollTimelineRef.current?.kill();
            scrollTimelineRef.current = null;
            scrolledRef.current = false;
            tickingRef.current = false;
          };
        }
      );

      return () => mm.revert();
    },
    { scope: navRef }
  );

  const links = useMemo(() => {
    if (!session) return [];

    const baseLinks = [
      { href: "/dashboard", label: session.user.role === "CUSTOMER" ? "Akun" : "Dashboard" },
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

  return (
    <>
      <nav ref={navRef} className="fixed left-0 right-0 top-0 z-[80] flex justify-center px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <div ref={shellRef} className="w-full max-w-7xl">
          {menuOpen && (
            <button
              type="button"
              aria-label="Tutup menu"
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-[84] bg-black/35 backdrop-blur-[2px] lg:hidden"
            />
          )}

          <div
            ref={panelRef}
            className="glass-panel nav-capsule-panel relative z-[90] mx-auto rounded-[24px] border border-white/10 px-4 py-3 sm:px-6"
          >
            <div className="flex items-center justify-between gap-4">
              <Link
                href={session ? "/dashboard" : "/"}
                className="flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-80"
                onClick={() => setMenuOpen(false)}
              >
                <div ref={logoRef} className="text-[color:var(--primary)] flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <path d="M3.3 7l8.7 5 8.7-5" />
                    <path d="M12 22V12" />
                  </svg>
                </div>
                <div ref={brandRef} className="min-w-0 overflow-hidden whitespace-nowrap">
                  <p className="truncate font-semibold text-slate-200 tracking-wide text-[14px]">
                    CV Banbuk Mandiri Jaya
                  </p>
                </div>
              </Link>

              <button
                onClick={() => setMenuOpen((value) => !value)}
                type="button"
                aria-expanded={menuOpen}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 lg:hidden"
              >
                Menu
              </button>

              <div className="hidden lg:flex lg:min-w-0 lg:flex-1 lg:items-center lg:justify-between">
                <div ref={linksRef} className="flex items-center gap-2">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-[color:var(--primary)]/10 hover:text-[color:var(--primary)]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {session ? (
                  <div ref={actionsRef} className="flex items-center gap-3">
                    <div className="flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-medium text-slate-100">
                      {session.user.name}
                    </div>

                    {session.user.role === "CUSTOMER" && (
                      <div className="flex items-center gap-2">
                        <Link
                          href="/wishlist"
                          aria-label="Wishlist"
                          onClick={() => setMenuOpen(false)}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 hover:border-[color:var(--primary)]/30 hover:text-[color:var(--primary)]"
                        >
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.5s-7-4.35-9-8.5C1.56 8.99 3.33 5.5 7 5.5c2.06 0 3.3 1.02 5 3 1.7-1.98 2.94-3 5-3 3.67 0 5.44 3.49 4 6.5-2 4.15-9 8.5-9 8.5Z" />
                          </svg>
                        </Link>
                      </div>
                    )}

                    <button onClick={handleLogout} className="app-button-secondary border-none hover:bg-white/5">
                      Logout
                    </button>
                  </div>
                ) : (
                  <div ref={actionsRef} className="flex items-center gap-3">
                    <Link href="/login" onClick={() => setMenuOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white">
                      Login
                    </Link>
                    <Link href="/register" onClick={() => setMenuOpen(false)} className="app-button-primary">
                      Mulai Sekarang
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`relative z-[90] mt-3 lg:hidden ${menuOpen ? "block" : "hidden"}`}>
            <div className="glass-panel nav-capsule-panel rounded-[28px] border border-white/10 px-5 py-5 shadow-[0_28px_80px_rgba(0,0,0,0.38)]">
              <div className="flex flex-col gap-3">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl px-4 py-3 text-base font-medium text-slate-200 transition-colors hover:bg-white/[0.04] hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}

                {session ? (
                  <>
                    <div className="mt-2 flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-medium text-slate-100">
                      {session.user.name}
                    </div>

                    {session.user.role === "CUSTOMER" && (
                      <Link
                        href="/wishlist"
                        aria-label="Wishlist"
                        onClick={() => setMenuOpen(false)}
                        className="mt-1 flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm font-medium text-slate-200 transition-colors hover:border-[color:var(--primary)]/30 hover:text-[color:var(--primary)]"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.5s-7-4.35-9-8.5C1.56 8.99 3.33 5.5 7 5.5c2.06 0 3.3 1.02 5 3 1.7-1.98 2.94-3 5-3 3.67 0 5.44 3.49 4 6.5-2 4.15-9 8.5-9 8.5Z" />
                        </svg>
                        Wishlist
                      </Link>
                    )}

                    <button onClick={handleLogout} className="app-button-secondary mt-2 border-none hover:bg-white/5">
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="mt-2 flex flex-col gap-3">
                    <Link href="/login" onClick={() => setMenuOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white">
                      Login
                    </Link>
                    <Link href="/register" onClick={() => setMenuOpen(false)} className="app-button-primary">
                      Mulai Sekarang
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div ref={spacerRef} className={`transition-[height] duration-200 ${menuOpen ? "h-[25rem] sm:h-32" : "h-24 sm:h-32"}`} />
    </>
  );
}
