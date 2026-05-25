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
    <InteractiveCard disabled className="product-catalog-card store-utility-card flex h-full flex-col">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-[color:var(--canvas-parchment)] p-7">
        <ProductImage src={product.image} alt={product.name} />
        {isCustomer && (
          <button
            type="button"
            onClick={() => onToggleWishlist(product.id)}
            className={`absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--ink)] ${
              isWishlisted ? "bg-[color:var(--primary)] text-white" : "bg-[color:var(--surface-chip)]"
            }`}
            aria-label={isWishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"}
          >
            <svg width="18" height="18" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M12 20.5s-7-4.35-9-8.5C1.56 8.99 3.33 5.5 7 5.5c2.06 0 3.3 1.02 5 3 1.7-1.98 2.94-3 5-3 3.67 0 5.44 3.49 4 6.5-2 4.15-9 8.5-9 8.5Z" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[17px] font-semibold leading-[1.24] tracking-[-0.374px] text-[color:var(--ink)]">
              {product.name}
            </h2>
            <p className="mt-1 text-[17px] leading-[1.47] tracking-[-0.374px] text-[color:var(--ink-muted-80)]">
              Rp {product.price.toLocaleString("id-ID")}
            </p>
          </div>
          <span className="text-[12px] leading-none tracking-[-0.12px] text-[color:var(--ink-muted-48)]">
            Stok {product.stock}
          </span>
        </div>

        <p className="mt-4 line-clamp-3 text-[14px] leading-[1.43] tracking-[-0.224px] text-[color:var(--ink-muted-80)]">
          {product.description}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 text-[14px] leading-[1.43] tracking-[-0.224px] text-[color:var(--ink-muted-80)]">
          <div className="rounded-lg bg-[color:var(--canvas-parchment)] px-3 py-2">
            <span className="block text-[12px] leading-none tracking-[-0.12px] text-[color:var(--ink-muted-48)]">Ukuran</span>
            <span className="mt-1 block truncate">{product.size}</span>
          </div>
          <div className="rounded-lg bg-[color:var(--canvas-parchment)] px-3 py-2">
            <span className="block text-[12px] leading-none tracking-[-0.12px] text-[color:var(--ink-muted-48)]">Bahan</span>
            <span className="mt-1 block truncate">{product.material}</span>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
          {isCustomer && (
            <>
              <Link href={`/products/${product.id}/payment`} className="app-button-primary min-h-0 px-4 py-2 text-[14px]">
                Buy
              </Link>
              <button type="button" onClick={() => onCreateInquiry(product.id)} className="text-[17px] text-[color:var(--primary)]">
                Inquiry
              </button>
            </>
          )}
          <button type="button" onClick={() => onToggleCompare(product.id)} className="text-[17px] text-[color:var(--primary)]">
            {isCompared ? "Remove compare" : "Compare"}
          </button>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="text-[17px] text-[color:var(--primary)]">
            WhatsApp
          </a>
          {isAdmin && (
            <Link href={`/products/${product.id}/edit`} className="button-pearl-capsule">
              Edit
            </Link>
          )}
        </div>
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
            className="pointer-events-auto w-full max-w-[400px] rounded-[18px] border border-[color:var(--hairline)] bg-white px-5 py-4 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--canvas-parchment)] text-[color:var(--primary)]"
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
                <p className="text-[14px] font-semibold leading-[1.29] tracking-[-0.224px] text-[color:var(--ink)]">{catalogNotice.title}</p>
                <p className="mt-1.5 text-[14px] leading-[1.43] tracking-[-0.224px] text-[color:var(--ink-muted-80)]">{catalogNotice.message}</p>
              </div>

              <button
                type="button"
                onClick={() => setCatalogNotice(null)}
                className="text-[14px] leading-[1.29] tracking-[-0.224px] text-[color:var(--primary)]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="bg-[color:var(--canvas-parchment)]">
        <div className="content-wrap py-20">
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

      <section className="content-wrap grid grid-cols-1 gap-5 py-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
