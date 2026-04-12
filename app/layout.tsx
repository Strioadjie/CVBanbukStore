import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Virtual Product Gallery Web3 - CV Banbuk Mandiri Jaya",
  description: "Platform pengelolaan produk dan penjualan dengan pembayaran crypto",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${manrope.variable} ${cormorant.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
