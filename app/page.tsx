import { Metadata } from 'next';
import { fetchStats, fetchLatestBlocks } from '@/lib/api';
import DashboardClient from '@/components/DashboardClient';



export const revalidate = 10;

export default async function Home() {
  const [stats, latestBlocks] = await Promise.all([
    fetchStats(),
    fetchLatestBlocks(50) 
  ]);

  return (
    <div className="bg-white min-h-screen font-sans">
      <DashboardClient initialStats={stats} initialBlocks={latestBlocks} />
    </div>
  );
}
