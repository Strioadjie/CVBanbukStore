import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    } else {
      // Customer hanya lihat transaksi sendiri
      transactions = await prisma.transaction.findMany({
        where: { userId: session.user.id },
        include: { product: true },
        orderBy: { createdAt: "desc" },
      });
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

    const { productId, amount, paymentType, txHash, walletAddress } = await req.json();

    if (!productId || !amount || !paymentType) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        productId,
        amount: parseFloat(amount),
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
