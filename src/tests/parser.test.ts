import Parser from '../utils/parser';
import { LLC } from '../utils/constants';
const fs = require('fs');

const WELLES_REPORT = fs.readFileSync(__dirname + '/assets/welles_only_report.txt', 'utf8');
describe('Testing Report Parser Utility', () => {
  describe('getTransactionPerHouse()', () => {
    it('should return empty array when getting transaction for house with no data', () => {
      expect(new Parser().getTransactionsTextForLoc(WELLES_REPORT, '346 Carrington Avenue Woonsocket, RI')).toEqual([]);
    });

    it('should return an array with 30 items representing the transactions in a month', () => {
      expect(new Parser().getTransactionsTextForLoc(WELLES_REPORT, '212 Welles Street').length).toEqual(30);
    });
  });

  describe('getObjectsFromData()', () => {
    it('should fail when the balance is incorrect', function () {
      const loc = '212 Welles St';
      const date = '01/01/2023';
      const desc = 'Francois Rentals, LLC.eCheck7F08-5A04Owner Draws - Owner payment for 01/2023 1,056.20';
      const expected = new Error(`balanceArray is bad for: ${desc}`);
      expect(() => new Parser().createTransactionFromData(loc, 0, date, desc)).toThrow(expected);
    });

    it('should return an object of data', function () {
      const parser = new Parser();
      parser.payeesPayers = [{ name: LLC }];
      const date = '03/01/2023';
      const desc = 'Francois Rentals, LLC. eCheck93DD-25D6Owner Draws - Owner payment for 03/20232,254.000.00';
      const expected = {
        balance: ['2,254.00', '0.00'],
        date: new Date(date),
        desc: 'Francois Rentals, LLC. eCheck93DD-25D6Owner Draws - Owner payment for 03/20232,254.000.00',
        location: '346 Carrington Avenue',
        outcome: 'payout',
        payeePayer: 'Francois Rentals, LLC.',
      };
      expect(parser.createTransactionFromData('', 100, date, desc)).toEqual(expected);
    });
  });
});
