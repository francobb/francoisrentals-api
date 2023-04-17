import { model, Schema, Document } from 'mongoose';
import { ITenant } from '@interfaces/tenants.interface';

const tenantsSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  lease_to: {
    type: Date,
    required: false,
  },
  move_in: {
    type: Date,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: Array,
    required: true,
  },
  property: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
});

const tenantsModel = model<ITenant & Document>('tenants', tenantsSchema);

tenantsSchema.index({ name: 1, email: 1 }, { unique: true });
export default tenantsModel;
