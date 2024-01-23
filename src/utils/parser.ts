import { CITY_STATE } from '@utils/constants';
import DataCollector from './dataCollector';
import DataTransformer from './dataTransformer';
import { PayeePayer } from '@interfaces/payeePayer.interface';

class Parser {
  private dataCollector: DataCollector;
  private dataTransformer: DataTransformer;

  constructor() {
    this.dataCollector = new DataCollector();
    this.dataTransformer = new DataTransformer();
  }

  public collectReportData(info: string, listOfPeople: PayeePayer[]) {
    this.dataCollector.setPayeesPayers(listOfPeople);
    const allTransactions = [];

    this.dataCollector.locations.forEach(location => {
      const fullLocation = `${location} ${CITY_STATE}`;
      const houseData = this.dataTransformer.getTransactionsTextForLoc(info, fullLocation);
      allTransactions.push(...this.dataCollector.collectAllTransactionsForLoc(houseData, location));
    });

    return allTransactions;
  }
}

export default Parser;
