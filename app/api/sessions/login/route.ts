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

    // Check if session exists
    const existingSession = await prisma.walletSession.findUnique({
      where: { walletAddress: normalizedAddress },
    });

    let session;

    if (existingSession) {
      // Update existing session
      session = await prisma.walletSession.update({
        where: { walletAddress: normalizedAddress },
        data: {
          isActive: true,
          lastActivityAt: new Date(),
        },
      });
    } else {
      // Create new session
      session = await prisma.walletSession.create({
        data: {
          walletAddress: normalizedAddress,
          isActive: true,
          lastActivityAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      session: {
        walletAddress: session.walletAddress,
        connectedAt: session.connectedAt,
        isActive: session.isActive,
      },
    });
  } catch (error) {
    console.error('POST /api/sessions/login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
