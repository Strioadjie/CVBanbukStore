// Middleware untuk proteksi route
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const isProductEditRoute = /^\/products\/[^/]+\/edit\/?$/.test(path);
    const isPaymentRoute = /^\/products\/[^/]+\/payment\/?$/.test(path);

    // Admin only routes
    if (path.startsWith("/products/add") || isProductEditRoute) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Customer only routes
    if (path.startsWith("/wishlist") || path.startsWith("/cart") || isPaymentRoute) {
      if (token?.role !== "CUSTOMER") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Protect these routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/add",
    "/products/:id/edit",
    "/products/:id/payment",
    "/cart/:path*",
    "/wishlist/:path*",
    "/inquiry/:path*",
  ],
};
