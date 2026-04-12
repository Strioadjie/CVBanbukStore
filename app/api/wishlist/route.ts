import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - Ambil wishlist user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const wishlists = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(wishlists);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Gagal mengambil wishlist" },
      { status: 500 }
    );
  }
}

// POST - Tambah ke wishlist
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId } = await req.json();

    // Cek apakah sudah ada di wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Produk sudah ada di wishlist" },
        { status: 400 }
      );
    }

    const wishlist = await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        productId,
      },
      include: { product: true },
    });

    return NextResponse.json(wishlist, { status: 201 });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { error: "Gagal menambah ke wishlist" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus dari wishlist
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID required" },
        { status: 400 }
      );
    }

    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    return NextResponse.json({ message: "Berhasil dihapus dari wishlist" });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { error: "Gagal menghapus dari wishlist" },
      { status: 500 }
    );
  }
}
