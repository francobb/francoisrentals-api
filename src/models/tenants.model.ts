import { model, Schema, Document } from 'mongoose';
import { Tenant } from '@interfaces/tenants.interface';

const tenantsSchema: Schema = new Schema({
  email: {
    type: String,
    required: false,
    unique: true,
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
    enum: ['23 Paradis Ave', '212 Welles St'],
  },
  unit: {
    type: String,
    required: true,
    enum: ['b', '1', '2', '3'],
  },
  customerId: {
    type: String,
    required: false,
  },
  rentalAmount: {
    type: Number,
    required: true,
  },
  rentalBalance: {
    type: Number,
    required: true,
  },
});

tenantsSchema.index({ property: 1, unit: 1, move_in: 1 }, { unique: true });
const tenantsModel = model<Tenant & Document>('Tenant', tenantsSchema);

// tenantsSchema.index({ name: 1, email: 1 }, { unique: true });
export default tenantsModel;
