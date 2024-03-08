import { CITY_STATE } from '@utils/constants';
import DataCollector from './dataCollector';
import DataTransformer from './dataTransformer';
import { PayeePayer } from '@interfaces/payeePayer.interface';
import { ITransaction } from '@interfaces/transactions.interface';

class Parser {
  public dataCollector = new DataCollector();
  public dataTransformer = new DataTransformer();

  public collectReportData(info: string, listOfPeople: PayeePayer[]) {
    this.dataCollector.setPayeesPayers(listOfPeople);
    const allTransactions: ITransaction[] = [];

    this.dataCollector.locations.forEach(location => {
      const fullLocation = `${location} ${CITY_STATE}`;
      const houseData = this.dataTransformer.getTransactionsTextForLoc(info, fullLocation);
      allTransactions.push(...this.dataCollector.collectAllTransactionsForLoc(houseData, location));
    });

    return allTransactions;
  }
}

export default Parser;
