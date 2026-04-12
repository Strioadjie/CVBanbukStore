import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Ambil statistik untuk dashboard
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role === "ADMIN") {
      // Stats untuk Admin
      const totalProducts = await prisma.product.count();
      const totalInquiries = await prisma.inquiry.count();
      const pendingInquiries = await prisma.inquiry.count({
        where: { status: "PENDING" },
      });
      const lowStockProducts = await prisma.product.count({
        where: { stock: { lte: 5 } },
      });
      const totalTransactions = await prisma.transaction.count();
      const totalRevenue = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED" },
      });
      const productsSnapshot = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          stock: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      });
      const recentInquiries = await prisma.inquiry.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { id: true, name: true } },
          user: { select: { id: true, name: true } },
        },
      });
      const completedTransactions = await prisma.transaction.findMany({
        where: { status: "COMPLETED" },
        select: {
          id: true,
          amount: true,
          createdAt: true,
          paymentType: true,
        },
        orderBy: { createdAt: "asc" },
      });

      // Produk terpopuler berdasarkan inquiry
      const popularProducts = await prisma.inquiry.groupBy({
        by: ["productId"],
        _count: { productId: true },
        orderBy: { _count: { productId: "desc" } },
        take: 5,
      });

      const popularProductsWithDetails = await Promise.all(
        popularProducts.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
          });
          return {
            product,
            inquiryCount: item._count.productId,
          };
        })
      );

      return NextResponse.json({
        totalProducts,
        totalInquiries,
        pendingInquiries,
        lowStockProducts,
        totalTransactions,
        totalRevenue: totalRevenue._sum.amount || 0,
        popularProducts: popularProductsWithDetails,
        completedTransactions,
        productsSnapshot,
        recentInquiries,
      });
    } else if (session.user.role === "SALES") {
      // Stats untuk Sales
      const assignedInquiries = await prisma.inquiry.count({
        where: { assignedTo: session.user.id },
      });
      const pendingInquiries = await prisma.inquiry.count({
        where: {
          assignedTo: session.user.id,
          status: "PENDING",
        },
      });
      const completedInquiries = await prisma.inquiry.count({
        where: {
          assignedTo: session.user.id,
          status: "SELESAI",
        },
      });

      return NextResponse.json({
        assignedInquiries,
        pendingInquiries,
        completedInquiries,
      });
    } else {
      // Stats untuk Customer
      const myInquiries = await prisma.inquiry.count({
        where: { userId: session.user.id },
      });
      const myWishlists = await prisma.wishlist.count({
        where: { userId: session.user.id },
      });
      const myTransactions = await prisma.transaction.count({
        where: { userId: session.user.id },
      });

      return NextResponse.json({
        myInquiries,
        myWishlists,
        myTransactions,
      });
    }
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Gagal mengambil statistik" },
      { status: 500 }
    );
  }
}
