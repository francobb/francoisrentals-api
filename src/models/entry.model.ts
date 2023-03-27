import { model, Schema, Document } from 'mongoose';
import { Entry } from '@interfaces/entry.interface';

const entrySchema: Schema = new Schema({
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

// entrySchema.index({ date: 1, desc: 1 }, { unique: true });
const entryModel = model<Entry & Document>('Entry', entrySchema);

export default entryModel;
