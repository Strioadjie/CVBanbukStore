import NextAuth from "next-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authHandler(req: Request, context: unknown) {
  const { authOptions } = await import("@/lib/auth");
  const handler = NextAuth(authOptions);
  return handler(req, context as never);
}

export { authHandler as GET, authHandler as POST };
