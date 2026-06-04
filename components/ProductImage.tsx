type ProductImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
  variant?: "jar" | "box" | "capsule";
};

const DUMMY_PRODUCT_IMAGES = [
  { keywords: ["ransel", "backpack", "laptop"], src: "/products/dummy-ransel.webp" },
  { keywords: ["dompet", "wallet"], src: "/products/dummy-dompet.webp" },
  { keywords: ["sepatu", "shoe"], src: "/products/dummy-sepatu.webp" },
  { keywords: ["pinggang", "belt"], src: "/products/dummy-belt.webp" },
  { keywords: ["jaket", "jacket"], src: "/products/dummy-jaket.webp" },
  { keywords: ["tas", "bag"], src: "/products/dummy-tas-kulit.webp" },
];

function resolveDummyProductImage(alt: string) {
  const normalizedAlt = alt.toLowerCase();
  return (
    DUMMY_PRODUCT_IMAGES.find((item) => item.keywords.some((keyword) => normalizedAlt.includes(keyword)))?.src ||
    "/products/dummy-general.webp"
  );
}

export default function ProductImage({
  src,
  alt,
  className = "",
  loading = "lazy",
}: ProductImageProps) {
  const customImageSrc = src?.trim();
  const imageSrc = customImageSrc || resolveDummyProductImage(alt);
  const imageClassName = customImageSrc
    ? `h-full w-full object-contain product-shadow ${className}`
    : `h-full w-full object-cover dummy-product-image ${className}`;

  return (
    <img
      src={imageSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      draggable={false}
      className={imageClassName}
    />
  );
}
