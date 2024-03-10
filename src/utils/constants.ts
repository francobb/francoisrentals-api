export const CARRINGTON = '346 Carrington Avenue';
export const CITY_STATE = 'Woonsocket, RI';
export const CURRENT_YEAR = new Date().getFullYear().toString();
export const ID_OF_FOLDER = '1jXtb1PHlAoHtHs3vfmSIgQF5rofvzO3Y';
export const LLC = 'Francois Rentals, LLC.';
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const PARADIS = '23 Paradis Avenue';
export const PERSONAL = 'Buteau Francois, Jr.';
export const PREV_YEAR = (new Date().getFullYear() - 1).toString();
export const TABLE_HEADERS = 'DatePayee / PayerTypeReferenceDescriptionIncomeExpenseBalance';
export const WELLES = '212 Welles Street';

// Regex Patterns
export const ACCT_NUM_REGEX_PATTERN = /Acct#\d{5}-\d{5}/gi;
export const BALANCE_DUE_REGEX_PATTERN = /Please Remit Balance Due(\d{1,3}(,\d{3})*\.\d{2})/gi;
export const BEGINNING_CASH_BALANCE_REGEX_PATTERN = /Beginning Cash Balance as of \d{2}\/\d{2}\/\d{4}\s?-?\d{1,3}(,\d{3})*\.\d{2}/gi;
export const DOLLAR_PARENTHESIS_REGEX_PATTERN = /\(\$\d+\.\)/g;
export const D_MM_YY_REGEX_PATTERN = /([1-9]|1[012])[- \/.](0?[1-9]|[12][0-9]|3[01])[- \/.](21|22|23)/gi;
export const MM_DD_YY_REGEX_PATTERN = /(0[1-9]|1[012])[- \/.](0?[1-9]|[12][0-9]|3[01])[- \/.](21|22|23)/gi;
export const ENDING_CASH_BALANCE_REGEX_PATTERN = /Ending Cash Balance+-?(\d{1,3}(,\d{3})*\.\d{2})/gi;
export const MM_DD_REGEX_PATTERN = /(1[0-2]|[1-9])\/(3[01]|[12][0-9]|[1-9])/gi;
export const MM_YYYY_REGEX_PATTERN = /(0[1-9]|1[012])[- \/.] ?(20)2[1-4]/gi;
export const MONEY_REGEX_PATTERN = /-?\d{1,3}(,\d{3})*(\.\d{2})/gi;
export const RPM_REGEX_PATTERN = /(Real\sProperty|Management\sProvidence)/gi;
export const TOTAL_REGEX_PATTERN = /Total/gi;
export const TRANSACTION_DATES_REGEX_PATTERN = /(?<! - )\b(\d{1,4}(\/)\d{1,2}(\/)\d{4})/gi;
export const TRANSACTION_TYPE_REFERENCE_REGEX_PATTERN_2 =
  /(Check|Bill Pay|Bill Pay Check|eCheck receipt|eCheck)\d+|[A-Za-z0-9]{4}-[A-Za-z0-9]{4}|CC |Receipt\s?\d*(-\d+)?/gi;
export const TRANSACTION_TYPE_REFERENCE_REGEX_PATTERN = new RegExp(
  [
    'Bill Pay\\d+',
    'Bill Pay Check \\d+',
    'Check\\d+',
    '\\s?CC\\s?receipt\\s?[A-Z\\d]+-[A-Z\\d+]{4}',
    '\\s?CC ',
    'eCheck receipt [A-Z]\\d+-[A-Z]\\d+',
    'eCheck receipt [A-Z\\d]+-[A-Z\\d+]{4}',
    'eCheck\\s?\\s?[A-Z\\d]+-[A-Z\\d+]{4}',
    '(?=.*[A-Za-z].*)[A-Za-z0-9]{4}-(?=.*[A-Za-z].*)[A-Za-z0-9]{4}',
    'Receipt\\s?\\d+-\\d+',
    'Receipt\\s?\\d+',
    'Receipt',
  ].join('|'),
  'gi',
);
