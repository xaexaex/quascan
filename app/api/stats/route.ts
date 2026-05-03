import { NextResponse } from 'next/server';
import { fetchStats } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const nodeStats = await fetchStats();
    
    if (!nodeStats) {
      throw new Error('Failed to fetch from node');
    }

    const stats = {
      blockHeight: nodeStats.chain_length - 1,
      difficulty: nodeStats.current_difficulty,
      mempoolSize: nodeStats.pending_transactions,
      peerCount: 8, // mocked, no peer api yet
      hashrate: "Unknown" // mocked
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
