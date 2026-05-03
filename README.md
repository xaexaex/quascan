# QuaScan Explorer

QuaScan is the official, high-performance block explorer for the **Quanta** post-quantum blockchain ecosystem. Built with Next.js 14, Tailwind CSS, and MongoDB, it provides a real-time, aesthetically rich interface for navigating blocks, transactions, and post-quantum cryptographic primitives on the Quanta network.

## Features

- **Real-Time Network Dashboard:** Live tracking of chain height, network hashrate, total supply, mining difficulty, and mempool status.
- **Deep Block Inspection:** View detailed metadata for individual blocks, including timestamps, nonces, and the exact miner responsible for the block.
- **Transaction & Signature Explorer:** Track transactions from mempool to confirmation. View full cryptographic details including raw **Falcon-512** public keys and post-quantum signatures.
- **Advanced Wallet Lookups:** Search for any Quanta address to view available balances, locked balances (coinbase maturity / vesting), and complete transaction history.
- **Idempotent Data Sync:** Powered by the backend `quanta-indexer` daemon, which continually synchronizes the Quanta node RPC state directly into a high-speed MongoDB instance.

## Technology Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons
- **Backend/API:** Next.js API Routes, Mongoose (MongoDB ORM)
- **Data Source:** MongoDB (populated continuously via the Rust-based `quanta-indexer`)

## Getting Started

### Prerequisites

1. **Node.js 18+** installed on your machine.
2. A running **MongoDB** instance (Local or Atlas) that is actively being populated by the `quanta-indexer` daemon.
3. (Optional) Access to a Quanta Node RPC endpoint if extending frontend functionality.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/quantascan.git
   cd quantascan
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your Environment Variables:
   Create a `.env.local` file in the root directory and specify your MongoDB connection string. **Crucially, ensure the URI points to the specific database name the indexer uses** (usually `quanta`).
   
   ```env
   # Example: MONGODB_URI=mongodb://127.0.0.1:27017/quanta
   # Example (Atlas): MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/quanta
   MONGODB_URI=your_mongodb_connection_string_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to explore the blockchain.

## Architecture Note

QuantaScan does **not** fetch block data directly from the blockchain RPC in real-time. To ensure lightning-fast page loads and mitigate node DDoS vectors, QuantaScan reads purely from its MongoDB instance. 

You **must** have the [quanta-indexer](https://github.com/your-username/quanta-indexer) daemon running in the background to continuously pull blocks from the node RPC and push them into MongoDB.

## Deployment (Vercel)

QuantaScan is optimized for zero-config deployment on Vercel.

1. Push your code to GitHub.
2. Import the project into Vercel.
3. In the Vercel project settings, add the `MONGODB_URI` environment variable.
4. Deploy!

*Note: Ensure your MongoDB Atlas cluster Network Access (IP Whitelisting) allows connections from Vercel (or is set to allow `0.0.0.0/0`).*
