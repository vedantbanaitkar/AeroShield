import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { PolicyRecord, CreatePolicyRecordInput } from "@/lib/policies";

const ALGO_SCALE = 1_000_000;

function isDatabaseUnavailableError(error: unknown) {
  const e = error as { code?: string; message?: string } | undefined;
  const code = e?.code ?? "";
  const message = (e?.message ?? "").toLowerCase();

  return (
    code === "P1001" ||
    message.includes("can't reach database server") ||
    message.includes("connection")
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreatePolicyRecordInput;

    const {
      walletAddress,
      productId,
      coverage,
      premium,
      appCallTxId,
      premiumPaymentTxId,
    } = body;

    if (!walletAddress || !productId) {
      return NextResponse.json(
        { error: "walletAddress and productId required" },
        { status: 400 },
      );
    }

    const buyTxId = appCallTxId || premiumPaymentTxId || `tx_${Date.now()}`;
    const coverageMicro = Math.max(0, Math.round((coverage || 0) * ALGO_SCALE));
    const premiumMicro = Math.max(0, Math.round((premium || 0) * ALGO_SCALE));

    let policy;
    try {
      policy = await prisma.policy.create({
        data: {
          walletAddress: walletAddress.toLowerCase(),
          productId,
          coverage: coverageMicro,
          premium: premiumMicro,
          buyTxId,
          status: "active",
        },
      });
    } catch (error: any) {
      // If the same tx is retried, return the existing policy instead of failing.
      if (error?.code === "P2002") {
        policy = await prisma.policy.findUnique({ where: { buyTxId } });
      } else {
        throw error;
      }
    }

    if (!policy) {
      return NextResponse.json(
        { error: "Unable to create or find policy record" },
        { status: 500 },
      );
    }

    const result: PolicyRecord = {
      id: policy.id,
      walletAddress: policy.walletAddress,
      productId: policy.productId as any,
      productLabel: productId,
      flightNumber: "",
      coverage: policy.coverage / ALGO_SCALE,
      premium: policy.premium / ALGO_SCALE,
      appId: 1000,
      premiumPaymentTxId: premiumPaymentTxId,
      appCallTxId: appCallTxId,
      createdAt: policy.createdAt.toISOString(),
      updatedAt: policy.updatedAt.toISOString(),
    };

    return NextResponse.json({ policy: result }, { status: 201 });
  } catch (error) {
    console.error("POST /api/policies/create error:", error);

    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json(
        {
          error:
            "Database temporarily unavailable. Policy may still be purchased on-chain; retry saving in a few seconds.",
          code: "DB_UNAVAILABLE",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
