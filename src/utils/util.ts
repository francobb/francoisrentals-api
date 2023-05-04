/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description this value is Empty Check
 */
export const isEmpty = (value: string | number | object): boolean => {
  if (value === null) {
    return true;
  } else if (typeof value !== 'number' && value === '') {
    return true;
  } else if (typeof value === 'undefined' || value === undefined) {
    return true;
  } else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
    return true;
  } else {
    return false;
  }
};

export function getLastDayOfMonth(year, monthNumber) {
  // Convert 1-indexed month number to 0-indexed value
  const month = monthNumber - 1;
  // Month parameter is 0-indexed, so we need to add 1 to get the next month
  const nextMonth = new Date(year, month + 1, 1);
  // Subtract one day in milliseconds to get the last day of the current month
  const lastDayOfMonth = new Date(nextMonth.getTime() - 86400000);
  // Return the date component of the last day of the month
  return lastDayOfMonth.getDate();
}
