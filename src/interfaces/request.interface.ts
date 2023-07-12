export interface MaintenanceRequest {
  _id: string;
  date: string;
  details: string;
  imagePaths: string[];
  location: string;
  room: string;
  unit: string;
}
