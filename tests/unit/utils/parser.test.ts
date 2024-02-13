import Parser from '../../../src/utils/parser';
import DataCollector from '../../../src/utils/dataCollector';
import DataTransformer from '../../../src/utils/dataTransformer';
import { PayeePayer } from '@interfaces/payeePayer.interface';

describe('Parser', () => {
  let mDataCollector: DataCollector;
  let mTransformer: DataTransformer;
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
    mDataCollector = parser.dataCollector;
    mTransformer = parser.dataTransformer;
  });

  it('should collect all transactions for each location', () => {
    const info = 'someInfo';
    const listOfPeople: PayeePayer[] = [{ name: 'person1' }, { name: 'person2' }];

    mDataCollector.locations = ['location1'];
    mDataCollector.setPayeesPayers = jest.fn();
    mTransformer.getTransactionsTextForLoc = jest.fn().mockReturnValue(['transaction1', 'transaction2']);
    mDataCollector.collectAllTransactionsForLoc = jest.fn().mockReturnValue(['transaction1', 'transaction2']);
    const result = parser.collectReportData(info, listOfPeople);

    expect(result).toEqual(['transaction1', 'transaction2']);
  });
});
