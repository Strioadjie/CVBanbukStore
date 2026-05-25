type ProductImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
};

export default function ProductImage({
  src,
  alt,
  className = "",
  loading = "lazy",
}: ProductImageProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        draggable={false}
        className={`h-full w-full object-contain product-shadow ${className}`}
      />
    );
  }

  return (
    <div className={`flex h-full w-full items-center justify-center bg-[color:var(--canvas-parchment)] ${className}`}>
      <div className="rounded-full border border-[color:var(--hairline)] bg-white px-5 py-3 text-sm font-semibold tracking-[-0.224px] text-[color:var(--ink-muted-80)] product-shadow">
        Banbuk
      </div>
    </div>
  );
}
