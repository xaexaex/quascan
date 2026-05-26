import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';
import { fetchStats } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Checkpoints | QuaScan Explorer',
  description:
    'Hardcoded consensus checkpoints for the Quanta testnet. These block hashes are baked into every node binary to prevent deep chain-reorganisation attacks.',
};

export const revalidate = 60;

// Mirror of TESTNET_CHECKPOINTS in quanta/src/consensus/blockchain.rs
// Update this list whenever a new checkpoint is added to the node.
const TESTNET_CHECKPOINTS: { height: number; hash: string; note?: string }[] = [
  { height: 0,       hash: '00000012d3a2cbb7eb9579330ccdaa4f83ca9e6e016bfe6d2c8a38539cf3733b', note: 'Genesis block — testnet alpha' },
  { height: 10_000,  hash: '0000013b6f5f570de0605eac1e7c2fde87f8ce30ca26acc26a9a78d9c18374d5' },
  { height: 20_000,  hash: '00000008ac637f1cf3f891de979b1ed7debb8862e0bbc9fdb64e90a19d773885' },
  { height: 30_000,  hash: '000001743b0b76fe64b28631afd7c923cf6eca06377dabe9fc8ebbbf8725ac6e' },
  { height: 40_000,  hash: '00000059783ae9efeb043ac6b1fa254fa338ccc5631dd1b7f96f6a498df07c86' },
  { height: 50_000,  hash: '0000010309330cd86087a9133848f80fc82b056f63adc0749e83894f0a4de956' },
  { height: 60_000,  hash: '0000010ce22920660ba1e42423ea46e76dc7582963d6f9f220e3930031bd9bc9', note: 'Verified 2026-05-05' },
  { height: 70_000,  hash: '000001fcb0637b06601b4f111b22070e856c8cabf2eaa545c41b938b4478d186' },
  { height: 80_000,  hash: '0000002d80e66bce37596616a9c9c3c1988da6e65811ad132926162c7e000a0e' },
  { height: 85_000,  hash: '0000007305d4ceeaf72a4f3c58001295a335d588e16a05f037d21dfb21ac06ca', note: 'Verified 2026-05-06' },
  { height: 90_000,  hash: '000000dc8e178a5140a5c68461234a9541373ac349b1ae3cbc3f0f3f1fc58d5e', note: 'State-root sort-fix boundary (v0.7.5+)' },
  { height: 95_000,  hash: '000001af31c4856116914ad6efc9163e5f8eebc2199dce2ccaa0888301407e83', note: 'Verified 2026-05-26' },
  { height: 100_000, hash: '000000430de2e07ad306cbf7755cd0ec32b48bb646f2eed0236f379a655804ee', note: 'Verified 2026-05-26' },
  { height: 110_000, hash: '0000011b7a2f213c82e80f84fd5ce77178c9334f300f910f6c11776140df7a0f', note: 'Verified 2026-05-26' },
  { height: 120_000, hash: '000000fb990939e7d6b5abc28617deac26f12a3eaf581bf25bd78fdb460ff472', note: 'Verified 2026-05-26' },
  { height: 130_000, hash: '0000009ceac47dfa1f36cdc02c7bebabd24f3b364f7b926e53cd2b0e33582c8a', note: 'Verified 2026-05-26' },
];

export default async function CheckpointsPage() {
  const stats = await fetchStats();
  const chainHeight = stats?.chain_length ?? 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-16">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-10">
        <div className="w-14 h-14 rounded-2xl bg-[#00E599]/10 border border-[#00E599]/30 flex items-center justify-center text-[#00E599] shadow-sm flex-shrink-0">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-black">Checkpoints</h1>
          <p className="text-gray-500 text-xs font-mono mt-1 max-w-xl">
            Hardcoded block hashes baked into every Quanta node. A node that encounters a
            block at a checkpointed height with a different hash is permanently rejected —
            preventing deep reorg attacks.
          </p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[#00E599]/30 shadow-sm p-5">
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">Total Checkpoints</p>
          <p className="text-2xl font-black text-[#00E599] font-mono">{TESTNET_CHECKPOINTS.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#00E599]/30 shadow-sm p-5">
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">Latest Anchored</p>
          <p className="text-2xl font-black text-black font-mono">
            #{TESTNET_CHECKPOINTS[TESTNET_CHECKPOINTS.length - 1].height.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-[#00E599]/30 shadow-sm p-5">
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">Chain Height</p>
          <p className="text-2xl font-black text-black font-mono">{chainHeight.toLocaleString()}</p>
        </div>
      </div>

      {/* Checkpoint Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-[#00E599]/30 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span className="font-bold text-sm text-gray-900 uppercase tracking-widest">Testnet Checkpoints</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Height</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Block Hash</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Note</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...TESTNET_CHECKPOINTS].reverse().map(({ height, hash, note }) => {
                const isPassed = chainHeight > height;
                const isTip = !isPassed;
                return (
                  <tr key={height} className="hover:bg-gray-50 transition-colors">
                    {/* Height */}
                    <td className="py-4 px-6">
                      <Link
                        href={`/block/${height}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#00E599]/10 border border-[#00E599]/20 text-black text-sm font-bold hover:border-[#00E599] hover:bg-[#00E599]/20 transition-colors"
                      >
                        #{height.toLocaleString()}
                      </Link>
                    </td>

                    {/* Hash */}
                    <td className="py-4 px-6 text-sm text-gray-500">
                      <Link
                        href={`/block/${height}`}
                        className="hover:text-[#00E599] transition-colors"
                        title={hash}
                      >
                        <span className="text-[#00E599]">{hash.substring(0, 10)}</span>
                        <span className="text-gray-400">…{hash.substring(hash.length - 8)}</span>
                      </Link>
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-6">
                      {isPassed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-widest">
                          <CheckCircle2 className="w-3 h-3" />
                          Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-widest">
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Note */}
                    <td className="py-4 px-6 text-xs text-gray-400 max-w-[220px] truncate">
                      {note || '—'}
                    </td>

                    {/* Explorer link */}
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/block/${height}`}
                        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-[#00E599] transition-colors"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <p className="text-[10px] font-mono text-gray-400 leading-relaxed">
            Source of truth:{' '}
            <code className="text-gray-600">quanta/src/consensus/blockchain.rs → TESTNET_CHECKPOINTS</code>.
            Hashes are verified independently from{' '}
            <a
              href="https://rpc.quantachain.org"
              target="_blank"
              rel="noreferrer"
              className="text-[#00E599] hover:underline"
            >
              rpc.quantachain.org
            </a>{' '}
            before being committed.
          </p>
        </div>
      </div>
    </div>
  );
}
