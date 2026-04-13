"use client";

import {
  memo,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import AppNavbar from "@/components/AppNavbar";
import InteractiveCard from "@/components/InteractiveCard";
import ProductImage from "@/components/ProductImage";
import LoadingScreen from "@/components/LoadingScreen";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  material: string;
  size: string;
  image?: string | null;
};

type WishlistItem = {
  product: {
    id: string;
  };
};

type CatalogNotice = {
  id: number;
  tone: "success" | "info" | "error";
  title: string;
  message: string;
};

type ProductCardProps = {
  product: Product;
  isAdmin: boolean;
  isCustomer: boolean;
  isCompared: boolean;
  isWishlisted: boolean;
  whatsappNumber: string;
  onToggleCompare: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
  onCreateInquiry: (productId: string) => void;
};

const DEFAULT_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "628123456789";

const ProductCard = memo(function ProductCard({
  product,
  isAdmin,
  isCustomer,
  isCompared,
  isWishlisted,
  whatsappNumber,
  onToggleCompare,
  onToggleWishlist,
  onCreateInquiry,
}: ProductCardProps) {
  const whatsappHref = useMemo(
    () =>
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Saya tertarik dengan produk ${product.name}. Mohon info detailnya.`
      )}`,
    [product.name, whatsappNumber]
  );

  return (
    <InteractiveCard
      disabled
      className="product-catalog-card glass-panel flex flex-col overflow-hidden border border-white/5 bg-white/[0.02]"
    >
      <div className="group relative aspect-[4/5] w-full shrink-0 overflow-hidden">
        <ProductImage src={product.image} alt={product.name} />

        <div className="absolute inset-0 bg-gradient-to-t from-[#101012] via-[#101012]/10 to-transparent opacity-80" />

        {isCustomer && (
          <button
            type="button"
            onClick={() => onToggleWishlist(product.id)}
            className={`absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border text-sm transition-colors ${
              isWishlisted
                ? "border-[color:var(--primary)] bg-[color:var(--primary)]/10 text-[color:var(--primary)]"
                : "border-white/20 bg-black/35 text-white hover:bg-white/10"
            }`}
            aria-label={
              isWishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"
            }
          >
            <svg
              width="13"
              height="13"
              fill={isWishlisted ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end px-4 pb-3 text-white">
          <span className="mb-1.5 inline-flex w-fit rounded border border-[color:var(--primary)]/30 bg-[#101012]/80 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-[color:var(--primary)]">
            Stok {product.stock}
          </span>
          <h2 className="line-clamp-1 text-lg font-medium leading-snug tracking-tight text-slate-100">
            {product.name}
          </h2>
          <p className="mt-0.5 text-sm font-semibold text-[color:var(--primary)]">
            Rp {product.price.toLocaleString()}
          </p>
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 flex translate-y-2 flex-col items-center justify-center gap-2 bg-[#101012]/88 p-4 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
          <p className="mb-2 line-clamp-3 text-center text-[11px] leading-relaxed text-slate-300">
            {product.description}
          </p>

          {isCustomer && (
            <>
              <button
                type="button"
                onClick={() => onCreateInquiry(product.id)}
                className="app-button-secondary w-full py-2 text-[11px]"
              >
                Kirim Inquiry
              </button>
              <Link
                href={`/products/${product.id}/payment`}
                className="app-button-primary w-full py-2 text-[11px]"
              >
                Beli Sekarang
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => onToggleCompare(product.id)}
            className="app-button-secondary w-full py-2 text-[11px]"
          >
            {isCompared ? "Uncompare" : "Compare"}
          </button>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="app-button-secondary flex w-full items-center justify-center gap-1.5 py-2 text-[11px]"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Tanya WhatsApp
          </a>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between bg-white/[0.01] p-3.5">
        <div className="flex w-full items-center justify-between divide-x divide-white/10 text-xs">
          <div className="flex flex-1 flex-col pr-2">
            <span className="text-[9px] uppercase tracking-widest text-slate-500">
              Ukuran
            </span>
            <span className="mt-0.5 truncate font-medium text-slate-300">
              {product.size}
            </span>
          </div>
          <div className="flex flex-1 flex-col pl-3">
            <span className="text-[9px] uppercase tracking-widest text-slate-500">
              Bahan
            </span>
            <span className="mt-0.5 truncate font-medium text-slate-300">
              {product.material}
            </span>
          </div>
        </div>

        {isAdmin && (
          <div className="mt-3 border-t border-white/5 pt-3">
            <Link
              href={`/products/${product.id}/edit`}
              className="app-button-secondary w-full border-dashed py-1.5 text-center text-[10px] uppercase tracking-widest opacity-70 hover:opacity-100"
            >
              Edit Tool
            </Link>
          </div>
        )}
      </div>
    </InteractiveCard>
  );
});

export default function ProductsPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistMap, setWishlistMap] = useState<Record<string, boolean>>({});
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [catalogNotice, setCatalogNotice] = useState<CatalogNotice | null>(null);
  const wishlistMapRef = useRef<Record<string, boolean>>({});
  const noticeTimeoutRef = useRef<number | null>(null);

  const role = session?.user.role;
  const isCustomer = role === "CUSTOMER";
  const isAdmin = role === "ADMIN";

  const showCatalogNotice = useCallback(
    (notice: Omit<CatalogNotice, "id">) => {
      if (noticeTimeoutRef.current) {
        window.clearTimeout(noticeTimeoutRef.current);
      }

      setCatalogNotice({
        ...notice,
        id: Date.now(),
      });

      noticeTimeoutRef.current = window.setTimeout(() => {
        setCatalogNotice(null);
        noticeTimeoutRef.current = null;
      }, 2800);
    },
    []
  );

  const fetchProducts = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/products", { signal });
      if (!res.ok) {
        throw new Error("Gagal memuat produk");
      }

      const data = (await res.json()) as Product[];
      if (signal?.aborted) {
        return;
      }

      startTransition(() => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      console.error("Error fetching products:", error);
      setLoading(false);
    }
  }, []);

  const fetchWishlistState = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/wishlist", { signal });
      if (!res.ok) {
        return;
      }

      const data = (await res.json()) as WishlistItem[];
      if (signal?.aborted) {
        return;
      }

      startTransition(() => {
        const nextMap = Object.fromEntries(
          data.map((item) => [item.product.id, true])
        );
        wishlistMapRef.current = nextMap;
        setWishlistMap(nextMap);
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      console.error("Error fetching wishlist state:", error);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchProducts(controller.signal);

    try {
      const storedCompare = localStorage.getItem("compare-products");
      if (storedCompare) {
        const parsed = JSON.parse(storedCompare);
        if (Array.isArray(parsed)) {
          setCompareIds(parsed);
        }
      }
    } catch (error) {
      console.error("Error reading compare state:", error);
    }

    return () => controller.abort();
  }, [fetchProducts]);

  useEffect(() => {
    return () => {
      if (noticeTimeoutRef.current) {
        window.clearTimeout(noticeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isCustomer) {
      return;
    }

    const controller = new AbortController();
    fetchWishlistState(controller.signal);

    return () => controller.abort();
  }, [fetchWishlistState, isCustomer]);

  const addToWishlist = useCallback(
    async (productId: string) => {
      try {
        if (wishlistMapRef.current[productId]) {
          const res = await fetch(`/api/wishlist?productId=${productId}`, {
            method: "DELETE",
          });

          if (res.ok) {
            setWishlistMap((prev) => {
              const next = { ...prev, [productId]: false };
              wishlistMapRef.current = next;
              return next;
            });
          }
          return;
        }

        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

        if (res.ok) {
          setWishlistMap((prev) => {
            const next = { ...prev, [productId]: true };
            wishlistMapRef.current = next;
            return next;
          });
          return;
        }

        const data = await res.json();
        showCatalogNotice({
          tone: "error",
          title: "Wishlist belum diperbarui",
          message: data.error || "Gagal menambahkan produk ke wishlist.",
        });
      } catch (error) {
        showCatalogNotice({
          tone: "error",
          title: "Terjadi kesalahan",
          message: "Wishlist belum bisa diperbarui. Silakan coba lagi.",
        });
      }
    },
    [showCatalogNotice]
  );

  const createInquiry = useCallback(async (productId: string) => {
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        const data = await res.json();
        showCatalogNotice({
          tone: "error",
          title: "Inquiry belum terkirim",
          message: data.error || "Gagal mengirim inquiry untuk produk ini.",
        });
        return;
      }

      showCatalogNotice({
        tone: "success",
        title: "Inquiry berhasil dikirim",
        message: "Tim kami akan meninjau inquiry Anda dan menindaklanjutinya secepatnya.",
      });
    } catch (error) {
      showCatalogNotice({
        tone: "error",
        title: "Terjadi kesalahan",
        message: "Kami belum bisa mengirim inquiry Anda. Silakan coba lagi.",
      });
    }
  }, [showCatalogNotice]);

  const toggleCompare = useCallback((productId: string) => {
    setCompareIds((prev) => {
      const exists = prev.includes(productId);
      let next = prev;

      if (exists) {
        next = prev.filter((id) => id !== productId);
        showCatalogNotice({
          tone: "info",
          title: "Perbandingan diperbarui",
          message: "Produk berhasil dikeluarkan dari daftar compare.",
        });
      } else if (prev.length < 2) {
        next = [...prev, productId];
        showCatalogNotice({
          tone: "success",
          title: "Produk ditambahkan",
          message: "Produk masuk ke daftar compare. Anda bisa membandingkan hingga 2 produk.",
        });
      } else {
        showCatalogNotice({
          tone: "error",
          title: "Compare penuh",
          message: "Maksimal 2 produk untuk dibandingkan dalam satu waktu.",
        });
        next = prev;
      }

      localStorage.setItem("compare-products", JSON.stringify(next));
      return next;
    });
  }, [showCatalogNotice]);

  const comparedProductIds = useMemo(() => new Set(compareIds), [compareIds]);

  if (loading) {
    return (
      <LoadingScreen
        label="Memuat katalog"
        detail="Produk dan detail utama sedang disiapkan."
      />
    );
  }

  return (
    <main className="page-shell pb-16">
      <AppNavbar />

      {catalogNotice && (
        <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[130] flex justify-center sm:inset-x-auto sm:right-6 sm:w-auto sm:justify-end">
          <div
            key={catalogNotice.id}
            className={`pointer-events-auto w-full max-w-[400px] rounded-[26px] border px-5 py-4 shadow-[0_28px_70px_rgba(0,0,0,0.35)] transition-all duration-300 ${
              catalogNotice.tone === "success"
                ? "border-emerald-400/20 bg-[linear-gradient(135deg,rgba(16,40,28,0.97),rgba(11,18,15,0.98))]"
                : catalogNotice.tone === "info"
                  ? "border-sky-400/20 bg-[linear-gradient(135deg,rgba(15,34,48,0.97),rgba(10,16,22,0.98))]"
                  : "border-rose-400/20 bg-[linear-gradient(135deg,rgba(52,20,24,0.97),rgba(18,12,14,0.98))]"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                  catalogNotice.tone === "success"
                    ? "bg-emerald-400/15 text-emerald-300"
                    : catalogNotice.tone === "info"
                      ? "bg-sky-400/15 text-sky-300"
                      : "bg-rose-400/15 text-rose-300"
                }`}
              >
                {catalogNotice.tone === "success" ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                ) : catalogNotice.tone === "info" ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8h.01" />
                    <path d="M11 12h1v4h1" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="m15 9-6 6" />
                    <path d="m9 9 6 6" />
                  </svg>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{catalogNotice.title}</p>
                <p className="mt-1.5 text-sm leading-6 text-slate-300">{catalogNotice.message}</p>
              </div>

              <button
                type="button"
                onClick={() => setCatalogNotice(null)}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300 transition-colors hover:border-white/20 hover:text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="content-wrap pt-8">
        <div className="glass-panel px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="section-kicker">Catalog</span>
              <h1 className="section-title">Katalog produk</h1>
              <p className="section-subtitle">
                Tampilan katalog dibuat lebih sederhana, fokus ke produk,
                spesifikasi utama, dan aksi yang benar-benar diperlukan.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {isAdmin && (
                <Link href="/products/add" className="app-button-primary">
                  Tambah Produk
                </Link>
              )}
              <Link href="/products/compare" className="app-button-secondary">
                Compare ({compareIds.length}/2)
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="content-wrap mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isAdmin={isAdmin}
            isCustomer={isCustomer}
            isCompared={comparedProductIds.has(product.id)}
            isWishlisted={Boolean(wishlistMap[product.id])}
            whatsappNumber={DEFAULT_WHATSAPP_NUMBER}
            onToggleCompare={toggleCompare}
            onToggleWishlist={addToWishlist}
            onCreateInquiry={createInquiry}
          />
        ))}
      </section>

      {products.length === 0 && (
        <section className="content-wrap mt-8">
          <div className="empty-state text-slate-400">
            Belum ada produk yang tersedia.
          </div>
        </section>
      )}
    </main>
  );
}
