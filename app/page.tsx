import { Metadata } from 'next';
import { fetchStats, fetchLatestBlocks, fetchValidators } from '@/lib/api';
import DashboardClient from '@/components/DashboardClient';
import dbConnect from '@/lib/db';
import TransactionModel from '@/lib/models/Transaction';


export const revalidate = 10;

export default async function Home() {
  await dbConnect();

  const [stats, latestBlocks, totalTxs, validators] = await Promise.all([
    fetchStats(),
    fetchLatestBlocks(50),
    TransactionModel.estimatedDocumentCount(),
    fetchValidators()
  ]);

  const statsToPass = stats ? { ...stats, total_transactions: totalTxs, validator_count: validators?.active_count ?? 7 } : { 
    chain_length: 0, 
    total_transactions: totalTxs, 
    current_epoch: 0, 
    mining_reward: 0, 
    total_supply: 0, 
    pending_transactions: 0,
    validator_count: validators?.active_count ?? 7
  };

  return (
    <div className="min-h-screen">
      <DashboardClient initialStats={statsToPass} initialBlocks={latestBlocks} />
    </div>
  );
}
