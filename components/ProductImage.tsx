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
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.28),transparent_46%),linear-gradient(135deg,#111827,#0f172a)] ${className}`}>
      <div className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
        Banbuk
      </div>
    </div>
  );
}
