import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - Ambil transaksi
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let transactions;

    if (session.user.role === "ADMIN") {
      // Admin bisa lihat semua transaksi
      transactions = await prisma.transaction.findMany({
        include: {
          product: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (session.user.role === "CUSTOMER") {
      // Customer hanya lihat transaksi sendiri
      transactions = await prisma.transaction.findMany({
        where: { userId: session.user.id },
        include: { product: true },
        orderBy: { createdAt: "desc" },
      });
    } else {
      return NextResponse.json(
        { error: "Transaksi hanya tersedia untuk admin dan customer" },
        { status: 403 }
      );
    }

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data transaksi" },
      { status: 500 }
    );
  }
}

// POST - Buat transaksi baru
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Checkout hanya tersedia untuk akun customer" },
        { status: 403 }
      );
    }

    const { productId, paymentType, txHash, walletAddress } = await req.json();

    if (!productId || !paymentType) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    if (!["REGULAR", "CRYPTO"].includes(paymentType)) {
      return NextResponse.json(
        { error: "Tipe pembayaran tidak valid untuk checkout langsung" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    if (product.stock < 1) {
      return NextResponse.json(
        { error: "Stok produk habis" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        productId,
        amount: product.price,
        paymentType,
        txHash: txHash || null,
        walletAddress: walletAddress || null,
        status: "COMPLETED",
      },
      include: { product: true },
    });

    // Update stok produk
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Gagal membuat transaksi" },
      { status: 500 }
    );
  }
}
