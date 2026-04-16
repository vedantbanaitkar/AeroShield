import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { PolicyRecord } from "@/lib/policies";

const ALGO_SCALE = 1_000_000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: "walletAddress required" },
        { status: 400 },
      );
    }

    const records = await prisma.policy.findMany({
      where: { walletAddress: walletAddress.toLowerCase() },
      orderBy: { updatedAt: "desc" },
    });

    const policies: PolicyRecord[] = records.map((record) => ({
      id: record.id,
      walletAddress: record.walletAddress,
      productId: record.productId as any,
      productLabel: record.productId,
      flightNumber: "",
      coverage: record.coverage / ALGO_SCALE,
      premium: record.premium / ALGO_SCALE,
      appId: 1000,
      premiumPaymentTxId: record.id,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      payoutTxId: record.payoutTxId || undefined,
      delayMinutes: record.delayMinutes || undefined,
      payoutTriggeredAt: record.payoutTriggeredAt?.toISOString(),
      lastOracleCheckAt: record.lastOracleCheckAt?.toISOString(),
    }));

    return NextResponse.json({ policies });
  } catch (error) {
    console.error("POST /api/policies error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
