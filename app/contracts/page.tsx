import { Metadata } from 'next';
import { Code2, ArrowRightLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import dbConnect from '@/lib/db';
import TransactionModel from '@/lib/models/Transaction';

export const metadata: Metadata = {
  title: 'Smart Contracts | Quanta Explorer',
  description: 'View WASM smart contracts deployed on the Quanta network',
};

export const revalidate = 10;

function shortHash(hash: string, len = 16) {
  if (!hash || hash.length <= len + 3) return hash;
  return `${hash.slice(0, len)}…`;
}

export default async function ContractsPage() {
  await dbConnect();
  
  // Find all ContractDeploy transactions to list contracts
  const deployments = await TransactionModel.find({ txType: 'ContractDeploy' })
    .sort({ blockHeight: -1 })
    .limit(50)
    .lean() as any[];

  return (
    <div className="page-wrap">
      <BackButton />

      <div className="page-header">
        <div className="page-icon">
          <Code2 size={20} />
        </div>
        <div>
          <span className="page-title">WASM Execution Environment</span>
          <h1 className="page-heading">Smart Contracts</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', letterSpacing: '0.04em', color: 'var(--c-text-3)', marginTop: 4 }}>
            Showing recent contract deployments
          </p>
        </div>
      </div>

      <div className="az-divider" style={{ marginBottom: 32 }} />

      <div className="panel" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--c-border-mid)', background: 'var(--c-surface)' }}>
              <th style={{ padding: '16px 20px', textAlign: 'left' }}><span className="panel-section-label">Contract Address (Tx Hash)</span></th>
              <th style={{ padding: '16px 20px', textAlign: 'left' }}><span className="panel-section-label">Deployer</span></th>
              <th style={{ padding: '16px 20px', textAlign: 'left' }}><span className="panel-section-label">Block</span></th>
              <th style={{ padding: '16px 20px', textAlign: 'left' }}><span className="panel-section-label">Fee Paid</span></th>
            </tr>
          </thead>
          <tbody>
            {deployments.map((tx, i) => (
              <tr
                key={tx.txHash}
                style={{
                  borderBottom: i === deployments.length - 1 ? 'none' : '1px solid var(--c-border)',
                  background: 'var(--c-bg-alt)',
                }}
              >
                <td style={{ padding: '14px 20px' }}>
                  <Link href={`/tx/${tx.txHash}`} className="hover-accent" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--c-accent)', textDecoration: 'none' }}>
                    {tx.txHash}
                  </Link>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <Link href={`/address/${tx.sender}`} className="hover-accent" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--c-text-2)', textDecoration: 'none' }}>
                    {shortHash(tx.sender, 14)}
                  </Link>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <Link href={`/block/${tx.blockHeight}`}>
                    <span className="tag tag-accent" style={{ fontSize: '0.5625rem' }}>#{tx.blockHeight}</span>
                  </Link>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--c-text-2)', whiteSpace: 'nowrap' }}>
                    {(tx.feeMicrounits / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 })} QUA
                  </span>
                </td>
              </tr>
            ))}
            {deployments.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '56px', textAlign: 'center' }}>
                  <span className="panel-section-label">No smart contracts deployed yet.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
