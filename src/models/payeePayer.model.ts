import { Document, model, Schema } from 'mongoose';
import { PayeePayer } from '@interfaces/payeePayer.interface';

const payeePayerSchema = new Schema({
  name: {
    type: String,
    unique: true,
  },
});

const payeePayerModel = model<PayeePayer & Document>('PayeePayer', payeePayerSchema);
export default payeePayerModel;
