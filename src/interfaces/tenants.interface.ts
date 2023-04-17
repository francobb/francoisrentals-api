export interface ITenant {
  _id: string;
  email: string;
  lease_to: Date;
  move_in: Date;
  name: string;
  phone: string[];
  property: string;
  unit: string;
}
