import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - Ambil semua produk
export async function GET(req: Request) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data produk" },
      { status: 500 }
    );
  }
}

// POST - Tambah produk baru (hanya ADMIN)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Hanya admin yang bisa menambah produk" },
        { status: 403 }
      );
    }

    const { name, price, stock, description, material, size, image } = await req.json();

    // Validasi input
    if (!name || !price || stock === undefined || !description || !material || !size) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        description,
        material,
        size,
        image: image || null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Gagal menambah produk" },
      { status: 500 }
    );
  }
}
