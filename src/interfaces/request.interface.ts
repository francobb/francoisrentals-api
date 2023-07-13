export interface MaintenanceRequest {
  _id: string;
  date: Date;
  details: string;
  imagePaths: string[];
  location: string;
  room: string;
  unit: string;
}
