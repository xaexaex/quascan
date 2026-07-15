import { NextResponse } from 'next/server';
import { fetchStats, fetchPeers } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [nodeStats, peersData] = await Promise.all([
      fetchStats(),
      fetchPeers()
    ]);
    
    if (!nodeStats) {
      throw new Error('Failed to fetch from node');
    }

    const stats = {
      blockHeight: nodeStats.chain_length - 1,
      epoch: nodeStats.current_epoch,
      currentSession: nodeStats.current_session || 0,
      blocksUntilNextSession: nodeStats.blocks_until_next_session || 0,
      mempoolSize: nodeStats.pending_transactions,
      peerCount: peersData?.peer_count || 0,
      hashrate: "Unknown" // mocked
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
