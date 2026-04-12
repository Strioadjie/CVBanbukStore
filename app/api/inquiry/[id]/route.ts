import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// PUT - Update inquiry (assign sales atau update status)
export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const inquiryId = context.params.id;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();

    // Admin bisa assign sales
    if (session.user.role === "ADMIN" && data.assignedTo) {
      const inquiry = await prisma.inquiry.update({
        where: { id: inquiryId },
        data: { assignedTo: data.assignedTo },
        include: {
          product: true,
          user: { select: { name: true, email: true } },
          sales: { select: { name: true, email: true } },
        },
      });

      return NextResponse.json(inquiry);
    }

    // Sales bisa update status
    if (session.user.role === "SALES" && data.status) {
      const inquiry = await prisma.inquiry.findUnique({
        where: { id: inquiryId },
      });

      if (inquiry?.assignedTo !== session.user.id) {
        return NextResponse.json(
          { error: "Anda tidak bisa update inquiry ini" },
          { status: 403 }
        );
      }

      const updatedInquiry = await prisma.inquiry.update({
        where: { id: inquiryId },
        data: { status: data.status },
        include: {
          product: true,
          user: { select: { name: true, email: true } },
        },
      });

      return NextResponse.json(updatedInquiry);
    }

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating inquiry:", error);
    return NextResponse.json(
      { error: "Gagal update inquiry" },
      { status: 500 }
    );
  }
}
