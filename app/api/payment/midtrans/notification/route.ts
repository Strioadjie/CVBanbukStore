import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { coreApi } from "@/lib/midtrans";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Webhook untuk menerima notifikasi dari Midtrans
export async function POST(req: Request) {
  try {
    const notification = await req.json();

    // Verify signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;
    const signatureKey = notification.signature_key;

    const hash = crypto
      .createHash("sha512")
      .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
      .digest("hex");

    if (hash !== signatureKey) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }

    // Get transaction status from Midtrans
    const api = await coreApi.get();
    const statusResponse = await api.transaction.status(orderId);
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log("Midtrans notification:", {
      orderId,
      transactionStatus,
      fraudStatus,
    });

    // Update transaction in database
    let status = "PENDING";

    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") {
        status = "COMPLETED";
      }
    } else if (transactionStatus === "settlement") {
      status = "COMPLETED";
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      status = "FAILED";
    } else if (transactionStatus === "pending") {
      status = "PENDING";
    }

    // Update transaction
    const transaction = await prisma.transaction.update({
      where: { id: orderId },
      data: {
        status: status,
        txHash: statusResponse.transaction_id, // Store Midtrans transaction ID
      },
    });

    // If completed, update product stock
    if (status === "COMPLETED") {
      await prisma.product.update({
        where: { id: transaction.productId },
        data: {
          stock: {
            decrement: 1,
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing Midtrans notification:", error);
    return NextResponse.json(
      { error: "Failed to process notification" },
      { status: 500 }
    );
  }
}
