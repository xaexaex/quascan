import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data - replace with actual API call
    const stats = {
      blockHeight: 12345,
      difficulty: "2.5K",
      mempoolSize: 23,
      peerCount: 42,
      hashrate: "125 MH/s"
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
