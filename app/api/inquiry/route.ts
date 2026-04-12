import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Ambil inquiry berdasarkan role
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let inquiries;

    if (session.user.role === "ADMIN") {
      // Admin bisa lihat semua inquiry
      inquiries = await prisma.inquiry.findMany({
        include: {
          product: true,
          user: { select: { id: true, name: true, email: true } },
          sales: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (session.user.role === "SALES") {
      // Sales hanya lihat inquiry yang di-assign ke mereka
      inquiries = await prisma.inquiry.findMany({
        where: { assignedTo: session.user.id },
        include: {
          product: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Customer hanya lihat inquiry mereka sendiri
      inquiries = await prisma.inquiry.findMany({
        where: { userId: session.user.id },
        include: {
          product: true,
          sales: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(inquiries);
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data inquiry" },
      { status: 500 }
    );
  }
}

// POST - Buat inquiry baru (CUSTOMER)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId, message } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID wajib diisi" },
        { status: 400 }
      );
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        productId,
        userId: session.user.id,
        message: message || "",
        status: "PENDING",
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return NextResponse.json(
      { error: "Gagal membuat inquiry" },
      { status: 500 }
    );
  }
}
