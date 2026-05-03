import mongoose, { Schema, Document } from 'mongoose';

export interface IBlock extends Document {
  index: number;
  hash: string;
  previousHash: string;
  timestamp: number;
  difficulty: number;
  nonce: number;
  txCount: number;
  miner: string;
  transactions: any[];
}

const BlockSchema: Schema = new Schema({
  index: { type: Number, required: true, unique: true },
  hash: { type: String, required: true },
  previousHash: { type: String, required: true },
  timestamp: { type: Number, required: true },
  difficulty: { type: Number, required: true },
  nonce: { type: Number, required: true },
  txCount: { type: Number, required: true },
  miner: { type: String, required: true },
  transactions: { type: Array, required: true }
}, {
  timestamps: true
});

BlockSchema.index({ hash: 1 });
BlockSchema.index({ miner: 1 });
BlockSchema.index({ timestamp: -1 });
BlockSchema.index({ index: -1 });

export default mongoose.models.Block || mongoose.model<IBlock>('Block', BlockSchema);
