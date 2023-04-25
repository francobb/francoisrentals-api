export interface ITransaction {
  _id: string;
  balance: Array<string>;
  date: Date;
  desc: string;
  location: string;
  outcome: string;
  payeePayer: string;
}
