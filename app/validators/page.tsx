import { fetchValidators } from "@/lib/api";
import Link from "next/link";
import { ShieldCheck, Cpu, Activity, UserCircle } from "lucide-react";

export default async function ValidatorsPage() {
  const data = await fetchValidators();

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-red-500">Error loading validators</h1>
        <p className="text-text-muted mt-2">Could not connect to the network RPC.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-text-primary">Consensus Nodes</h1>
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-0.5">
            Active Validators: <span className="text-accent">{data.active_count}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="quantum-panel p-5 border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Total Nodes</span>
            <Cpu className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-black">{data.validators.length}</div>
        </div>
        <div className="quantum-panel p-5 border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Active</span>
            <Activity className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-black text-green-500">{data.active_count}</div>
        </div>
        <div className="quantum-panel p-5 border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Algorithm</span>
            <ShieldCheck className="w-4 h-4 text-accent" />
          </div>
          <div className="text-xl font-bold font-mono">AlephBFT (PQC)</div>
        </div>
      </div>

      <div className="quantum-panel overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono whitespace-nowrap">
            <thead>
              <tr className="border-b border-border bg-surface-2/30">
                <th className="py-3 px-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Status</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Validator Address</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Stake (QUA)</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Registered Epoch</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Public Key Snippet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.validators.map((val, idx) => (
                <tr key={val.address} className="hover:bg-surface-2/10 transition-colors">
                  <td className="py-3 px-4">
                    {val.active ? (
                      <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        Active
                      </span>
                    ) : (
                      <span className="bg-text-muted/10 text-text-muted border border-text-muted/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <Link href={`/address/${val.address}`} className="flex items-center gap-2 text-text-primary hover:text-accent font-bold transition-colors">
                      <UserCircle className="w-4 h-4 text-text-muted" />
                      {val.address}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-xs font-bold text-accent">
                    {(val.stake_microunits / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-xs text-text-secondary font-semibold">
                    Epoch {val.registered_epoch}
                  </td>
                  <td className="py-3 px-4 text-[10px] text-text-muted font-mono" title={val.falcon_pk_hex}>
                    {val.falcon_pk_hex.substring(0, 16)}...{val.falcon_pk_hex.substring(val.falcon_pk_hex.length - 16)}
                  </td>
                </tr>
              ))}
              {data.validators.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted text-xs font-medium uppercase tracking-widest">
                    No validators registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
