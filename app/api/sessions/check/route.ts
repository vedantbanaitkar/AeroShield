import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all active sessions
    const activeSessions = await prisma.walletSession.findMany({
      where: { isActive: true },
      orderBy: { lastActivityAt: 'desc' },
    });

    return NextResponse.json({
      sessions: activeSessions.map(s => ({
        walletAddress: s.walletAddress,
        connectedAt: s.connectedAt,
        lastActivityAt: s.lastActivityAt,
        isActive: s.isActive,
      })),
    });
  } catch (error) {
    console.error('GET /api/sessions/check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
