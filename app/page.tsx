import { Metadata } from 'next';
import { fetchStats, fetchLatestBlocks } from '@/lib/api';
import DashboardClient from '@/components/DashboardClient';
import dbConnect from '@/lib/db';
import TransactionModel from '@/lib/models/Transaction';


export const revalidate = 10;

export default async function Home() {
  await dbConnect();

  const [stats, latestBlocks, totalTxs] = await Promise.all([
    fetchStats(),
    fetchLatestBlocks(50),
    TransactionModel.estimatedDocumentCount()
  ]);

  const statsToPass = stats ? { ...stats, total_transactions: totalTxs } : { 
    chain_length: 0, 
    total_transactions: totalTxs, 
    current_epoch: 0, 
    mining_reward: 0, 
    total_supply: 0, 
    pending_transactions: 0 
  };

  return (
    <div className="min-h-screen">
      <DashboardClient initialStats={statsToPass} initialBlocks={latestBlocks} />
    </div>
  );
}
