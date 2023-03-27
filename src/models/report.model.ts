import mongoose, { Schema } from 'mongoose';
import { Report } from '@interfaces/report.interface';

const reportSchema = new Schema({
  month: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  data: {
    type: Buffer,
    required: true,
  },
});

reportSchema.index({ month: 1, year: 1 }, { unique: true });

const reportModel = mongoose.model<Report & Document>('Report', reportSchema);
export default reportModel;
