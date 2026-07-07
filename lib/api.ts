export const RPC_URL = "https://rpc.quantachain.org";

export interface NetworkStats {
  chain_length: number;
  total_transactions: number;
  current_epoch: number;
  mining_reward: number;
  total_supply: number;
  pending_transactions: number;
}

export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previous_hash: string;
  hash: string;
  merkle_root: string;
  state_root: string;
  // BFT consensus fields
  epoch: number;
  bft_round: number;
  proposer: string;
  bft_signatures: any[];
  bft_signers: string[];
}

export interface Transaction {
  sender: string;
  recipient: string;
  amount: number;
  fee: number;
  nonce: number;
  signature: string;
  public_key: string;
}

export async function fetchStats(): Promise<NetworkStats | null> {
  try {
    const res = await fetch(`${RPC_URL}/api/stats`, {
      next: { revalidate: 10 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch stats", error);
    return null;
  }
}

export async function fetchBlock(height: number): Promise<Block | null> {
  try {
    const res = await fetch(`${RPC_URL}/api/block/${height}`, {
      next: { revalidate: 60 }, // Blocks don't change, cache longer
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Failed to fetch block at ${height}`, error);
    return null;
  }
}

export async function fetchLatestBlocks(count: number = 10): Promise<Block[]> {
  try {
    const res = await fetch(`${RPC_URL}/api/blocks/latest?count=${count}`, {
      next: { revalidate: 10 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.blocks || [];
  } catch (error) {
    console.error("Failed to fetch latest blocks", error);
    return [];
  }
}

export interface LockedBalance {
  amount_microunits: number;
  amount_qua: number;
  unlock_height: number;
}

export interface AddressInfo {
  address: string;
  balance_microunits: number;
  balance_qua: number;
  total_balance_microunits: number;
  total_balance_qua: number;
  nonce: number;
  locked_balances: LockedBalance[];
}

export async function fetchAddressInfo(address: string): Promise<AddressInfo | null> {
  try {
    const res = await fetch(`${RPC_URL}/api/address/${address}`, {
      cache: 'no-store', // Balance must always be live — never serve a cached null
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Failed to fetch address info for ${address}`, error);
    return null;
  }
}

export interface AddressTransaction {
  tx_hash: string;
  block_height: number;
  block_time: number;
  sender: string;
  recipient: string;
  amount_microunits: number;
  fee_microunits: number;
  tx_type: string;
}

export interface AddressTxsResponse {
  address: string;
  transaction_count: number;
  transactions: AddressTransaction[];
}

export async function fetchAddressTransactions(address: string, maxBlocks: number = 10000): Promise<AddressTxsResponse | null> {
  try {
    const res = await fetch(`${RPC_URL}/api/address/${address}/txs?max_blocks=${maxBlocks}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Failed to fetch txs for ${address}`, error);
    return null;
  }
}

export interface TxDetailResponse {
  tx_hash: string;
  status: string;
  transaction: Transaction;
  block_height: number | null;
}

export async function fetchTx(hash: string): Promise<TxDetailResponse | null> {
  try {
    const res = await fetch(`${RPC_URL}/api/tx/${hash}`, {
      cache: 'no-store', // TX status changes (pending → confirmed) — never cache
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Failed to fetch tx ${hash}`, error);
    return null;
  }
}

export interface ValidatorInfo {
  address: string;
  falcon_pk_hex: string;
  stake_microunits: number;
  registered_epoch: number;
  active: boolean;
  is_online: boolean;
  node_version: number | null;
}

export interface ValidatorsResponse {
  active_count: number;
  validators: ValidatorInfo[];
}

export async function fetchValidators(): Promise<ValidatorsResponse | null> {
  try {
    const res = await fetch(`${RPC_URL}/api/validators`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch validators", error);
    return null;
  }
}

export interface PeersResponse {
  peer_count: number;
  peers: {
    address: string;
    node_id: string;
    height: number;
    connected_for: number;
  }[];
}

export async function fetchPeers(): Promise<PeersResponse | null> {
  try {
    const res = await fetch(`${RPC_URL}/api/peers`, {
      next: { revalidate: 15 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch peers", error);
    return null;
  }
}
