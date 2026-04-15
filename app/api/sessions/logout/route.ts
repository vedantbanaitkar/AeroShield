import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: 'walletAddress required' }, { status: 400 });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // Mark session as inactive
    const session = await prisma.walletSession.update({
      where: { walletAddress: normalizedAddress },
      data: {
        isActive: false,
        lastActivityAt: new Date(),
      },
    });

    return NextResponse.json({
      session: {
        walletAddress: session.walletAddress,
        isActive: session.isActive,
      },
    });
  } catch (error) {
    console.error('POST /api/sessions/logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
