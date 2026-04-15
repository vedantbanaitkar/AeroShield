import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { PolicyRecord } from "@/lib/policies";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      payoutTxId,
      delayMinutes,
      payoutTriggeredAt,
      lastOracleCheckAt,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (payoutTxId) updateData.payoutTxId = payoutTxId;
    if (delayMinutes !== undefined) updateData.delayMinutes = delayMinutes;
    if (payoutTriggeredAt)
      updateData.payoutTriggeredAt = new Date(payoutTriggeredAt);
    if (lastOracleCheckAt)
      updateData.lastOracleCheckAt = new Date(lastOracleCheckAt);

    // Set status to 'paid' if payoutTxId is provided
    if (payoutTxId) updateData.status = "paid";

    const policy = await prisma.policy.update({
      where: { id },
      data: updateData,
    });

    const result: PolicyRecord = {
      id: policy.id,
      walletAddress: policy.walletAddress,
      productId: policy.productId as any,
      productLabel: policy.productId,
      flightNumber: "",
      coverage: policy.coverage,
      premium: policy.premium,
      appId: 1000,
      premiumPaymentTxId: policy.id,
      createdAt: policy.createdAt.toISOString(),
      updatedAt: policy.updatedAt.toISOString(),
      payoutTxId: policy.payoutTxId || undefined,
      delayMinutes: policy.delayMinutes || undefined,
      payoutTriggeredAt: policy.payoutTriggeredAt?.toISOString(),
      lastOracleCheckAt: policy.lastOracleCheckAt?.toISOString(),
    };

    return NextResponse.json({ policy: result });
  } catch (error) {
    console.error("PATCH /api/policies/update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
