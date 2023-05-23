import Parser from '@utils/parser';
import { CARRINGTON, LLC } from '@utils/constants';
const fs = require('fs');

const WELLES_REPORT = fs.readFileSync('src/tests/assets/welles_only_report.txt', 'utf8');
describe('Testing Report Parser Utility', () => {
  describe('getTransactionsTextForLoc()', () => {
    it('should return empty array when getting transaction for house with no data', () => {
      expect(new Parser().getTransactionsTextForLoc(WELLES_REPORT, '346 Carrington Avenue Woonsocket, RI')).toEqual([]);
    });

    it('should return an array with 30 items representing the transactions in a month', () => {
      expect(new Parser().getTransactionsTextForLoc(WELLES_REPORT, '212 Welles Street').length).toEqual(30);
    });
  });

  describe('createTransactionFromData()', () => {
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
      expect(parser.createTransactionFromData(CARRINGTON, 100, date, desc)).toEqual(expected);
    });

    it('should return an object of data now', function () {
      const parser = new Parser();
      parser.payeesPayers = [{ name: LLC }];
      const date = '03/01/2023';
      const desc = 'John Gotti eCheck93DD-25D6Owner Draws - Owner payment for 03/20232,254.000.00';
      const expected = {
        balance: ['2,254.00', '0.00'],
        date: new Date(date),
        desc: 'John Gotti eCheck93DD-25D6Owner Draws - Owner payment for 03/20232,254.000.00',
        location: '346 Carrington Avenue',
        outcome: 'expense',
        payeePayer: 'Service-Expense',
      };
      expect(parser.createTransactionFromData(CARRINGTON, 100, date, desc)).toEqual(expected);
    });
  });

  describe('collectAllTransactionsForLoc', function () {
    it('should return data', function () {
      const parser = new Parser();
      const transactionData = {
        _id: 'fakeId',
        location: '212 Welles Street',
        outcome: 'income',
        payeePayer: 'Joshua Vanbever',
        balance: ['2,254.00', '0.00'],
        date: new Date('03/01/2023'),
        desc: 'Joshua VanbeverCC receipt8F4C-B940Unit 2 - Rent Income - Rent Income995.001,990.00',
      };
      parser.createTransactionFromData = jest.fn().mockReturnValue(transactionData);
      parser.getTransactionsTextForLoc = jest
        .fn()
        .mockReturnValue(['06/09/2021 ', 'Joshua VanbeverCC receipt8F4C-B940Unit 2 - Rent Income - Rent Income995.001,990.00 ']);
      const result = parser.collectReportData(WELLES_REPORT, ['Joshua Vanbever']);

      expect(parser.getTransactionsTextForLoc).toHaveBeenCalledTimes(3);
      expect(result).toEqual([transactionData, transactionData, transactionData]);
    });
  });
});
