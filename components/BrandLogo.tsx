type BrandLogoProps = {
  showText?: boolean;
  className?: string;
  markClassName?: string;
  textClassName?: string;
  subTextClassName?: string;
  compact?: boolean;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function BrandLogo({
  showText = true,
  className = "",
  markClassName = "h-8 w-8",
  textClassName = "text-[17px]",
  subTextClassName = "text-[10px]",
  compact = false,
}: BrandLogoProps) {
  return (
    <span className={cx("inline-flex items-center gap-2.5", className)}>
      <svg className={cx("shrink-0", markClassName)} viewBox="0 0 64 64" role="img" aria-label="Logo CV Banbuk Store">
        <rect width="64" height="64" rx="18" fill="url(#banbuk-logo-bg)" />
        <rect x="7" y="7" width="50" height="50" rx="14" stroke="url(#banbuk-logo-frame)" strokeWidth="1.4" opacity="0.78" />
        <path
          d="M20 28.2C20 25.9 21.9 24 24.2 24h15.6c2.3 0 4.2 1.9 4.2 4.2V45c0 2.2-1.8 4-4 4H24c-2.2 0-4-1.8-4-4V28.2Z"
          fill="url(#banbuk-logo-bag)"
        />
        <path d="M25.5 25v-3.2c0-3.7 2.9-6.8 6.5-6.8s6.5 3.1 6.5 6.8V25" stroke="#F5D89C" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M20.8 35.5h22.4" stroke="#08100D" strokeOpacity="0.22" strokeWidth="1.8" strokeLinecap="round" />
        <text
          x="32"
          y="43.5"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="15"
          fontWeight="800"
          letterSpacing="0"
          fill="#07110D"
        >
          CB
        </text>
        <defs>
          <linearGradient id="banbuk-logo-bg" x1="8" y1="7" x2="56" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#18201B" />
            <stop offset="1" stopColor="#050706" />
          </linearGradient>
          <linearGradient id="banbuk-logo-frame" x1="12" y1="8" x2="54" y2="57" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F5D89C" />
            <stop offset="0.48" stopColor="#00D4A4" />
            <stop offset="1" stopColor="#8E5B2C" />
          </linearGradient>
          <linearGradient id="banbuk-logo-bag" x1="20" y1="21" x2="45" y2="51" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F2D6A3" />
            <stop offset="0.42" stopColor="#C89152" />
            <stop offset="1" stopColor="#00D4A4" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span className="min-w-0 leading-none">
          <span className={cx("block whitespace-nowrap font-semibold tracking-normal text-white", textClassName)}>
            CV Banbuk Store
          </span>
          {!compact && (
            <span className={cx("mt-1 block whitespace-nowrap font-semibold uppercase tracking-[0.16em] text-white/45", subTextClassName)}>
              Mandiri Jaya
            </span>
          )}
        </span>
      )}
    </span>
  );
}
