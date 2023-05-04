import { logger } from '@utils/logger';
import {
  CARRINGTON,
  CITY_STATE,
  CURRENT_YEAR,
  DATES_REGEX_PATTERN,
  D_MM_YY_REGEX_PATTERN,
  LLC,
  MM_YYYY_REGEX_PATTERN,
  MONEY_REGEX_PATTERN,
  PARADIS,
  PERSONAL,
  PREV_YEAR,
  WELLES,
} from '@utils/constants';

class Parser {
  public payeesPayers = [];
  public locations = [WELLES, PARADIS, CARRINGTON];
  public collectReportData(info: string, listOfPeople: any[]) {
    this.payeesPayers = listOfPeople;
    const allTransactions = [];

    this.locations.forEach(location => {
      allTransactions.push(...this.collectAllTransactionsForLoc(this.getTransactionsTextForLoc(info, `${location} ${CITY_STATE}`), location));
    });

    return allTransactions;
  }
  private collectAllTransactionsForLoc(houseData: string | any[], loc: string) {
    const totalTransactions = [];
    let ogBalance = 0;

    for (let i = 0; i < houseData.length; i += 2) {
      const transaction = this.createTransactionFromData(loc, ogBalance, houseData[i], houseData[i + 1].trim());
      ogBalance = parseFloat(transaction.balance[1].replace(/,/g, ''));
      totalTransactions.push(transaction);
    }

    return totalTransactions;
  }
  public createTransactionFromData(loc: string, ogBalance: number, date: any, desc: any) {
    let payeePayer = this.payeesPayers.find(v => desc.includes(v.name))?.name; // extract Payee / Payer
    const isPayout = payeePayer === PERSONAL || payeePayer === LLC;
    const balanceArray = this.getBalanceFromText(desc);
    const outcome = isPayout ? 'payout' : parseFloat(balanceArray[1].replace(/,/g, '')) >= ogBalance ? 'income' : 'expense';

    if (!outcome) {
      this.#_logError('outcome', desc);
      throw new Error(`Outcome is missing for: ${desc}`);
    }
    if (!payeePayer) {
      if (outcome === 'income') payeePayer = 'Francois Rentals, LLC.';
      if (outcome === 'expense') payeePayer = 'Service-Expense';
    }

    return {
      balance: balanceArray,
      date: new Date(date),
      desc,
      location: loc,
      outcome,
      payeePayer,
    };
  }
  public getTransactionsTextForLoc(info, location) {
    let transactionsInMonth = '';

    const [first_line, last_line, other_last_line, dateRegex] = [
      /Beginning Cash Balance as of \d{2}\/\d{2}\/\d{4}\d+\.\d{2}/gi,
      /Ending Cash Balance+-?(\d{1,3}(,\d{3})*\.\d{2})/gi,
      // /Total+(\d{1,3}(,\d{3})*\.\d{2})+(\d{1,3}(,\d{3})*\.\d{2})/gi,
      /Total/gi,
      /(?<! - )\b(\d{1,4}([.\-/])\d{1,2}([.\-/])\d{4})/gi,
    ];

    info = this.#cleanUpPageOfText(info);
    let cleanedUp = info
      .replaceAll('\n', ' ')
      .split('\n')
      .filter(w => w)
      .toString();

    if (cleanedUp.search(location) < 0) {
      return [];
    }
    cleanedUp = cleanedUp.substring(cleanedUp.search(location));

    const firstLineMatch = first_line.exec(cleanedUp)[0];
    const lastLineMatch = last_line.exec(cleanedUp);
    const otherLastLineMatch = other_last_line.exec(cleanedUp);

    let trueLastLineMatch: string;

    if (!lastLineMatch) {
      trueLastLineMatch = otherLastLineMatch[0];
    } else {
      trueLastLineMatch = lastLineMatch[0];
    }

    transactionsInMonth = this.findTransactionsInMonth(cleanedUp, firstLineMatch, trueLastLineMatch);
    transactionsInMonth = this.#cleanUpTableHeadersFromText(transactionsInMonth);

    return transactionsInMonth
      .split(DATES_REGEX_PATTERN)
      .filter(w => w)
      .filter(w => w !== '/');
  }

  getBalanceFromText(desc) {
    const balanceArray = this.#cleanDatesFromText(desc).match(MONEY_REGEX_PATTERN);

    if (!balanceArray || balanceArray.length < 2) {
      this.#_logError('balanceArray', desc);
      throw new Error(`balanceArray is bad for: ${desc}`);
    }

    return balanceArray;
  }
  #cleanDatesFromText(text) {
    return text.replaceAll(D_MM_YY_REGEX_PATTERN, '').replaceAll(MM_YYYY_REGEX_PATTERN, '').replaceAll(CURRENT_YEAR, '').replaceAll(PREV_YEAR, '');
  }
  #cleanUpTableHeadersFromText(
    text,
    ttr: Array<string | RegExp> = [
      'DatePayee / PayerTypeReferenceDescriptionIncomeExpenseBalance',
      /Please Remit Balance Due(\d{1,3}(,\d{3})*\.\d{2})/gi,
    ],
  ) {
    ttr.forEach(txt => {
      text = text.replaceAll(txt, '');
    });
    return text.trim();
  }
  #cleanUpPageOfText(text) {
    const rgx = /page \d+ of \d/gi;
    return text.replaceAll(rgx, '');
  }
  findTransactionsInMonth(cleanedUp: any, firstLineMatch: string, lastLineMatch: string) {
    return cleanedUp.substring(cleanedUp.indexOf(firstLineMatch) + firstLineMatch.length, cleanedUp.indexOf(lastLineMatch));
  }
  #_logError(item: string, desc: string) {
    logger.error(`${item} is bad for: ${desc}`);
  }
}

export default Parser;
