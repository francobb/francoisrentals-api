export type PropertyType = '23 Paradis Ave' | '212 Welles St';

export interface Tenant {
  _id: string;
  customerId: string;
  email: string;
  lease_to?: Date;
  move_in: Date;
  name: string;
  phone: string[];
  property: PropertyType;
  rentalAmount: number;
  rentalBalance: number;
  unit: string;
}
