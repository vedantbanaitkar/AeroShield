import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { PolicyRecord, CreatePolicyRecordInput } from '@/lib/policies';

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
        { error: 'walletAddress and productId required' },
        { status: 400 }
      );
    }

    const policy = await prisma.policy.create({
      data: {
        walletAddress: walletAddress.toLowerCase(),
        productId,
        coverage: coverage || 0,
        premium: premium || 0,
        buyTxId: appCallTxId || premiumPaymentTxId || `tx_${Date.now()}`,
        status: 'active',
      },
    });

    const result: PolicyRecord = {
      id: policy.id,
      walletAddress: policy.walletAddress,
      productId: policy.productId as any,
      productLabel: productId,
      flightNumber: '',
      coverage: policy.coverage,
      premium: policy.premium,
      appId: 1000,
      premiumPaymentTxId: premiumPaymentTxId,
      appCallTxId: appCallTxId,
      createdAt: policy.createdAt.toISOString(),
      updatedAt: policy.updatedAt.toISOString(),
    };

    return NextResponse.json({ policy: result }, { status: 201 });
  } catch (error) {
    console.error('POST /api/policies/create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
