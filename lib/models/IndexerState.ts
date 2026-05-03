import mongoose, { Schema, Document } from 'mongoose';

export interface IIndexerState extends Document {
  key: string;
  value: number;
}

const IndexerStateSchema: Schema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Number, required: true }
}, {
  timestamps: true
});

export default mongoose.models.IndexerState || mongoose.model<IIndexerState>('IndexerState', IndexerStateSchema);
