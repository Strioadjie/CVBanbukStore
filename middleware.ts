// Middleware untuk proteksi route
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin only routes
    if (path.startsWith("/products/add") || path.startsWith("/products/edit")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Customer only routes
    if (path.startsWith("/wishlist")) {
      if (token?.role !== "CUSTOMER") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
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
    "/wishlist/:path*",
    "/inquiry/:path*",
  ],
};
