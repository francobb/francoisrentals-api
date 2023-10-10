import { getLastDayOfMonth } from '@utils/util';

describe('util', function () {
  describe('getLastDayOfMonth', function () {
    it('should expect it to return last day of a month', function () {
      expect(getLastDayOfMonth(2023, 3)).toEqual(31);
    });
  });
});
