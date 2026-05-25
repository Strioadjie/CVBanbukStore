import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CV Banbuk Mandiri Jaya",
  description: "Platform katalog produk, inquiry, dan pembayaran CV Banbuk Mandiri Jaya.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/icon.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
