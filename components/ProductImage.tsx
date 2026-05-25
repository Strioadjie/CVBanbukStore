type ProductImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
  variant?: "jar" | "box" | "capsule";
};

export default function ProductImage({
  src,
  alt,
  className = "",
  loading = "lazy",
  variant = "jar",
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

  const initials = alt
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <div className={`flex h-full w-full items-center justify-center ${className}`}>
      {variant === "box" ? (
        <div className="product-shadow relative h-[72%] w-[56%] rounded-[8px] bg-[#173c1b] p-5 text-[#eef3e7]">
          <div className="absolute inset-0 rounded-[8px] bg-[radial-gradient(circle_at_48%_42%,rgba(255,255,255,0.22),transparent_12%),linear-gradient(115deg,rgba(255,255,255,0.18),transparent_35%)]" />
          <p className="relative text-[18px] font-semibold">Seed</p>
          <div className="relative mt-20 h-3 w-3 rounded-full bg-[#e8efe2]" />
          <p className="relative mt-10 text-[11px] font-bold uppercase tracking-[0.15em]">{initials || "BMJ"}</p>
        </div>
      ) : variant === "capsule" ? (
        <div className="product-shadow flex items-center gap-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-28 w-9 rounded-full bg-[linear-gradient(180deg,#edf4df_0%,#edf4df_48%,#173c1b_49%,#173c1b_100%)]" />
          ))}
        </div>
      ) : (
        <div className="product-shadow relative h-[74%] w-[58%] max-w-[280px] rounded-b-[18px] rounded-t-[10px] bg-[linear-gradient(145deg,#6c8b34,#173c1b_62%,#0c250e)]">
          <div className="absolute -top-[12%] left-[-2%] h-[24%] w-[104%] rounded-[50%] bg-[linear-gradient(180deg,#1b2e1c,#071508)]" />
          <div className="absolute inset-0 rounded-b-[18px] rounded-t-[10px] bg-[radial-gradient(circle_at_48%_43%,rgba(255,255,255,0.5),transparent_5%),radial-gradient(circle_at_55%_46%,rgba(255,255,255,0.16),transparent_26%)]" />
          <p className="absolute left-1/2 top-[24%] -translate-x-1/2 text-[18px] font-semibold text-[#e8efe2]">Seed</p>
          <p className="absolute bottom-[18%] left-1/2 w-full -translate-x-1/2 px-4 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-[#e8efe2]">
            {initials || "BMJ"} daily
          </p>
        </div>
      )}
    </div>
  );
}
