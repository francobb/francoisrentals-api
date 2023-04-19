import { model, Schema, Document } from 'mongoose';
import { Tenant } from '@interfaces/tenants.interface';

const tenantsSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
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
  },
  unit: {
    type: String,
    required: true,
  },
});

const tenantsModel = model<Tenant & Document>('Tenant', tenantsSchema);

// tenantsSchema.index({ name: 1, email: 1 }, { unique: true });
export default tenantsModel;
