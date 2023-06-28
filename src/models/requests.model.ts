import { model, Schema } from 'mongoose';
import { MaintenanceRequest } from '@interfaces/request.interface';

const maintenanceRequestSchema: Schema = new Schema({
  details: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
});

const maintenanceRequestModel = model<MaintenanceRequest & Document>('MaintenanceRequest', maintenanceRequestSchema);

export default maintenanceRequestModel;
