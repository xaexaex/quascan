import { Metadata } from 'next';
import { fetchBalance } from '@/lib/api';
import { Wallet, Coins, History, CheckCircle2 } from 'lucide-react';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = await params;
  return {
    title: `Address ${p.id.substring(0, 10)}... | QuantaScan Explorer`,
    description: `Details for address ${p.id} on the Quanta network.`,
  };
}

export const revalidate = 10;

export default async function AddressDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  if (!id) {
    notFound();
  }

  const data = await fetchBalance(id);
  
  if (!data) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-[#00E599]/10 flex items-center justify-center text-[#00E599] flex-shrink-0 mt-1">
          <Wallet className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-black mb-2 flex items-center gap-3">
            Address
          </h1>
          <div className="inline-flex max-w-full">
            <span className="bg-gray-50 border border-gray-100 rounded-lg p-3 font-mono text-sm md:text-base text-gray-600 break-all select-all flex items-center gap-2">
              {data.address}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Balance Card */}
        <div className="sol-card p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#00E599]" />
            Balance Synopsis
          </h3>
          
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Current Balance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tighter text-black">
                  {(data.balance_microunits / 1_000_000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </span>
                <span className="text-xl font-bold text-gray-500">QUA</span>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account Nonce</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-md">
                  {data.nonce}
                </span>
                <span className="text-xs text-gray-400 font-medium">Transactions sent from this address</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Info Card */}
        <div className="sol-card p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-[#00E599]" />
            Transaction History
          </h3>
          <div className="bg-white/60 p-5 rounded-xl border border-[#00E599]/20">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <CheckCircle2 className="w-5 h-5 text-[#00E599]" />
              </div>
              <p className="text-sm text-gray-600 font-medium leading-relaxed">
                Transaction history indexer is currently tracking live networks.
                <br /><br />
                Historical transactions for specific addresses are directly visible within their respective Block details pages. Look out for the next major network update for standalone transaction explorer functionality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
