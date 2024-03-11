import DataTransformer from './dataTransformer';
import { CARRINGTON, PARADIS, WELLES } from '@utils/constants';
import { PayeePayer } from '@interfaces/payeePayer.interface';

class DataCollector {
  public payeesPayers = [];
  public locations = Object.freeze([WELLES, PARADIS, CARRINGTON]);
  private dataTransformer = new DataTransformer();

  public setPayeesPayers = (listOfPeople: PayeePayer[]) => {
    this.payeesPayers = listOfPeople;
  };

  public collectAllTransactionsForLoc = (houseData: string | any[], loc: string, balance: number) => {
    const totalTransactions = [];
    let ogBalance = balance;

    for (let i = 0; i < houseData.length; i += 2) {
      const transaction = this.dataTransformer.createTransactionFromData(loc, ogBalance, houseData[i], houseData[i + 1].trim(), this.payeesPayers);

      ogBalance = this.dataTransformer.updateBalance(transaction, ogBalance);
      totalTransactions.push(transaction);
    }

    return totalTransactions;
  };
}

export default DataCollector;
