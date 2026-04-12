import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMidtransTransaction } from "@/lib/midtrans";

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

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID required" },
        { status: 400 }
      );
    }

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check stock
    if (product.stock < 1) {
      return NextResponse.json(
        { error: "Product out of stock" },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const orderId = `ORDER-${Date.now()}-${session.user.id.slice(0, 8)}`;

    // Create transaction in database (status: PENDING)
    const transaction = await prisma.transaction.create({
      data: {
        id: orderId,
        userId: session.user.id,
        productId: product.id,
        amount: product.price,
        paymentType: "MIDTRANS",
        status: "PENDING",
      },
    });

    // Create Midtrans transaction
    const midtransResult = await createMidtransTransaction({
      orderId: orderId,
      amount: product.price,
      customerDetails: {
        firstName: session.user.name,
        email: session.user.email,
      },
      itemDetails: [
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ],
    });

    if (!midtransResult.success) {
      // Delete transaction if Midtrans failed
      await prisma.transaction.delete({
        where: { id: orderId },
      });

      return NextResponse.json(
        { error: midtransResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: orderId,
      token: midtransResult.token,
      redirectUrl: midtransResult.redirectUrl,
    });
  } catch (error) {
    console.error("Error creating Midtrans transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
