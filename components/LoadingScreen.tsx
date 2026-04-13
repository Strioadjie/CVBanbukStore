"use client";

type LoadingScreenProps = {
  label?: string;
  detail?: string;
};

export default function LoadingScreen({
  label = "Menyiapkan pengalaman Banbuk",
  detail = "Memuat tampilan, data, dan detail produk dengan transisi yang halus.",
}: LoadingScreenProps) {
  return (
    <div className="loading-screen page-shell" role="status" aria-live="polite" aria-label={label}>
      <span className="sr-only">{detail}</span>
      <div className="loading-screen__ambient" />
      <div className="loading-screen__ambient loading-screen__ambient--secondary" />

      <div className="loading-screen__center">
        <div className="loading-mark">
          <span className="loading-mark__frame" />
          <span className="loading-mark__frame loading-mark__frame--inner" />
          <span className="loading-mark__beam" />
        </div>

        <div className="loading-trail">
          <span className="loading-trail__line" />
          <span className="loading-trail__pulse" />
        </div>
      </div>
    </div>
  );
}
