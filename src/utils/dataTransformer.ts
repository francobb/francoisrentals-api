import { logger } from '@utils/logger';
import {
  ACCT_NUM_REGEX_PATTERN,
  BALANCE_DUE_REGEX_PATTERN,
  BEGINNING_CASH_BALANCE_REGEX_PATTERN,
  CURRENT_YEAR,
  D_MM_YY_REGEX_PATTERN,
  DOLLAR_PARENTHESIS_REGEX_PATTERN,
  ENDING_CASH_BALANCE_REGEX_PATTERN,
  LLC,
  MM_DD_REGEX_PATTERN,
  MM_DD_YY_REGEX_PATTERN,
  MM_YYYY_REGEX_PATTERN,
  MONEY_REGEX_PATTERN,
  PERSONAL,
  PREV_YEAR,
  RPM_REGEX_PATTERN,
  TABLE_HEADERS,
  TOTAL_REGEX_PATTERN,
  TRANSACTION_DATES_REGEX_PATTERN,
  TRANSACTION_TYPE_REFERENCE_REGEX_PATTERN,
} from '@utils/constants';
import type { IPendingTransaction } from '@interfaces/transactions.interface';

class DataTransformer {
  public ADDRESS_REGEX = {
    '346 Carrington Avenue Woonsocket, RI': /346\sCarrington\sAvenue\s?\n?Woonsocket,\sRI/gi,
    '23 Paradis Avenue Woonsocket, RI': /23\sParadis\sAvenue\s?\n?Woonsocket,\sRI/gi,
  };
  public getTransactionsTextForLoc = (reportData: string, location: string) => {
    let transactionsInMonth = '';

    reportData = this.cleanUpPageOfText(reportData);
    let reportSansMetaData = this.cleanEmptySpacesFromText(reportData);

    const locationRegex = this.ADDRESS_REGEX[location];

    if (reportSansMetaData.search(locationRegex || location) < 0) {
      return [];
    }

    reportSansMetaData = reportSansMetaData.substring(reportSansMetaData.search(locationRegex || location));
    //todo: do checks before getting indexed data
    const [firstLineMatch] = new RegExp(BEGINNING_CASH_BALANCE_REGEX_PATTERN).exec(reportSansMetaData);
    const lastLineMatch = new RegExp(ENDING_CASH_BALANCE_REGEX_PATTERN).exec(reportSansMetaData);
    const otherLastLineMatch = new RegExp(TOTAL_REGEX_PATTERN).exec(reportSansMetaData);

    let trueLastLineMatch: string;

    if (!lastLineMatch) {
      trueLastLineMatch = otherLastLineMatch[0];
    } else {
      trueLastLineMatch = lastLineMatch[0];
    }

    transactionsInMonth = this.findTransactionsInMonth(reportSansMetaData, firstLineMatch, trueLastLineMatch);
    transactionsInMonth = this.cleanUpTableHeadersFromText(transactionsInMonth);

    return transactionsInMonth
      .split(TRANSACTION_DATES_REGEX_PATTERN)
      .filter(w => w)
      .filter(w => w !== '/');
  };

  public createTransactionFromData = (loc: string, ogBalance: number, date: any, desc: string, payeePayers?: { name: string }[]) => {
    let payeePayer = this.findPayeePayer(desc, payeePayers);
    const balanceArray = this.getBalanceFromText(desc);
    const outcome = this.determineOutcome(payeePayer, ogBalance, balanceArray, desc);

    if (!payeePayer) {
      desc.includes('Real Property');
      payeePayer = outcome === 'income' ? 'Francois Rentals, LLC.' : desc.includes('Real Property' || 'RPM') ? 'RPM Providence' : 'Service-Expense';
    }

    desc = this.cleanDescription(desc, payeePayer, balanceArray);

    const parsedDate = this.parseDateString(date);

    return {
      balance: balanceArray,
      date: parsedDate,
      desc,
      location: loc,
      outcome,
      payeePayer,
    };
  };

  public parseDateString(dateString: string) {
    const [month, day, year] = dateString.split('/');
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 5, 0));
  }

  formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  }

  public updateBalance = (transaction: IPendingTransaction, ogBalance: number) => {
    if (transaction.outcome === 'expense') {
      const newBalance = (ogBalance - parseFloat(transaction.balance.at(1).replace(/,/g, ''))).toFixed(2);
      if (transaction.balance.at(0) != newBalance) {
        transaction.balance[0] = newBalance;
      }
    }

    return Number(parseFloat(transaction.balance.at(1).replace(/,/g, '')).toFixed(2));
  };

  private getBalanceFromText(desc: string) {
    const balanceArray = this.cleanDatesFromText(desc).match(MONEY_REGEX_PATTERN);

    if (!balanceArray || balanceArray.length !== 2) {
      this.logError(`balanceArray is returning ${balanceArray.length}`, desc);
    }

    return balanceArray.slice(-2);
  }

  private findTransactionsInMonth(cleanedUp: any, firstLineMatch: string, lastLineMatch: string) {
    return cleanedUp.substring(cleanedUp.indexOf(firstLineMatch) + firstLineMatch.length, cleanedUp.indexOf(lastLineMatch));
  }

  private cleanEmptySpacesFromText(text: string) {
    return text.replaceAll('\n\n', ' ').replaceAll('\n', ' ');
  }

  private cleanDatesFromText(text: string) {
    return text
      .replace(ACCT_NUM_REGEX_PATTERN, '')
      .replaceAll(DOLLAR_PARENTHESIS_REGEX_PATTERN, '')
      .replaceAll(MM_YYYY_REGEX_PATTERN, '')
      .replaceAll(MM_DD_REGEX_PATTERN, '')
      .replaceAll(MM_DD_YY_REGEX_PATTERN, '')
      .replaceAll(D_MM_YY_REGEX_PATTERN, '')
      .replaceAll(CURRENT_YEAR, '')
      .replaceAll(PREV_YEAR, '');
  }

  private cleanUpTableHeadersFromText(text: string, ttr: Array<string | RegExp> = [TABLE_HEADERS, BALANCE_DUE_REGEX_PATTERN]) {
    ttr.forEach(txt => {
      text = text.replaceAll(txt, '');
    });
    return text.trim();
  }

  private cleanUpPageOfText(text: string) {
    return text.replaceAll(/page \d+ of \d/gi, '');
  }

  private cleanDescription(desc: string, payeePayer: string, balanceArray: string[]) {
    desc = desc
      .replace(payeePayer, '')
      .replace(balanceArray.at(0) + balanceArray.at(1), '')
      .replaceAll(TRANSACTION_TYPE_REFERENCE_REGEX_PATTERN, '')
      .trim()
      .replace(/^-/, '');

    return desc.replaceAll(RPM_REGEX_PATTERN, '').trim();
  }

  private determineOutcome(payeePayer: string, ogBalance: number, balanceArray: string[], desc: string) {
    const isTransfer = payeePayer === 'Transfer' || desc.includes('Transfer');
    const isPayout = (payeePayer === PERSONAL || payeePayer === LLC) && +balanceArray[0].replace(',', '') === ogBalance;
    return isPayout ? 'payout' : isTransfer ? 'Transfer' : parseFloat(balanceArray[1].replace(/,/g, '')) >= ogBalance ? 'income' : 'expense';
  }

  private findPayeePayer(desc: string, payeesPayers: { name: string }[]) {
    const payeePayer = payeesPayers.find(v => desc.includes(v.name))?.name;
    return payeePayer === 'Real Property Management Providence' || payeePayer === 'RPM' ? 'RPM Providence' : payeePayer;
  }

  private logError(item: string, desc: string) {
    logger.error(`${item} for: ${desc}`);
  }
}

export default DataTransformer;
