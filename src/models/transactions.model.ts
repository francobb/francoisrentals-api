import { model, Schema, Document } from 'mongoose';
import { ITransaction } from '@interfaces/transactions.interface';

const transactionsSchema: Schema = new Schema({
  balance: {
    type: Array,
    required: true,
    unique: false,
  },
  date: {
    type: Date,
    required: true,
    unique: false,
  },
  desc: {
    type: String,
    required: true,
    unique: false,
  },
  location: {
    type: String,
    required: true,
    unique: false,
  },
  outcome: {
    type: String,
    required: true,
    unique: false,
  },
  payeePayer: {
    type: String,
    required: true,
    unique: false,
  },
});

transactionsSchema.index({ desc: 1 }, { unique: true });
const transactionsModel = model<ITransaction & Document>('Transaction', transactionsSchema);

export default transactionsModel;
