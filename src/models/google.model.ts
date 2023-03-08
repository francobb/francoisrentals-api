import { model, Schema, Document } from 'mongoose';
import { Google } from '@interfaces/google.interface';

const GoogleSchema: Schema = new Schema({
  refresh_token: {
    type: String,
    required: true,
    unique: true,
  },
  access_token: {
    type: String,
    required: true,
  },
  token_type: {
    type: String,
    required: true,
  },
  expiry_date: {
    type: String,
    required: true,
  },
});

const googleModel = model<Google & Document>('Google', GoogleSchema);

export default googleModel;
