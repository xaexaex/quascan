import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  txHash: string;
  blockHeight: number;
  blockTime: number;
  sender: string;
  recipient: string;
  amountMicrounits: number;
  feeMicrounits: number;
  signature: string;
  publicKey: string;
  txType?: string;
}

const TransactionSchema: Schema = new Schema({
  txHash: { type: String, required: true, unique: true },
  blockHeight: { type: Number, required: true },
  blockTime: { type: Number, required: true },
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  amountMicrounits: { type: Number, required: true },
  feeMicrounits: { type: Number, required: true },
  signature: { type: String, required: true },
  publicKey: { type: String, required: true },
  txType: { type: String, required: false }
}, {
  timestamps: true
});

TransactionSchema.index({ sender: 1 });
TransactionSchema.index({ recipient: 1 });
TransactionSchema.index({ blockHeight: -1 });
TransactionSchema.index({ blockTime: 1 });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
