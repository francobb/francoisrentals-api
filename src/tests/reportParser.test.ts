import { getObjectFromData } from '../utils/reportParser';

describe('Testing Report Parser Utility', () => {
  it('parser can return an object with outcome payout from a line of data', () => {
    const loc = '212 Welles St';
    const date = '01/01/2023';
    const desc = 'Francois Rentals, LLC.eCheck7F08-5A04Owner Draws - Owner payment for 01/20231,056.200.00';
    const expected = {
      balance: ['1,056.20', '0.00'],
      date,
      desc,
      location: loc,
      outcome: 'payout',
      payeePayer: 'Francois Rentals, LLC.',
    };
    expect(getObjectFromData(loc, 0, date, desc)).toEqual(expected);
  });

  it('should fail when the balance is incorrect', function () {
    const loc = '212 Welles St';
    const date = '01/01/2023';
    const desc = 'Francois Rentals, LLC.eCheck7F08-5A04Owner Draws - Owner payment for 01/2023 1,056.20';
    const expected = new Error(`balanceArray is bad for: ${desc}`);
    expect(() => getObjectFromData(loc, 0, date, desc)).toThrow(expected);
  });

  it('should return an object with outcome as income from a line of data', function () {
    const loc = '212 Welles St';
    const date = '01/01/2023';
    const desc = 'Shane Kamer, LLC.eCheck7F08-5A04Owner Draws - Owner payment for 01/2023 1,056.20100.00';
    const expected = {
      balance: ['1,056.20', '100.00'],
      date,
      desc,
      location: loc,
      outcome: 'income',
      payeePayer: 'Shane Kamer',
    };
    expect(getObjectFromData(loc, 0, date, desc)).toEqual(expected);
  });
});
