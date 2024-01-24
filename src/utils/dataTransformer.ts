import { logger } from '@utils/logger';
import {
  BALANCE_DUE_REGEX_PATTERN,
  BEGINNING_CASH_BALANCE_REGEX_PATTERN,
  CURRENT_YEAR,
  D_MM_YY_REGEX_PATTERN,
  DOLLAR_PARENTHESIS_REGEX_PATTERN,
  ENDING_CASH_BALANCE_REGEX_PATTERN,
  LLC,
  MM_DD_REGEX_PATTERN,
  MM_YYYY_REGEX_PATTERN,
  MONEY_REGEX_PATTERN,
  PERSONAL,
  PREV_YEAR,
  TABLE_HEADERS,
  TOTAL_REGEX_PATTERN,
  TRANSACTION_DATES_REGEX_PATTERN,
  TRANSACTION_TYPE_REFERENCE_REGEX_PATTERN,
} from '@utils/constants';
import type { IPendingTransaction } from '@interfaces/transactions.interface';

class DataTransformer {
  public getTransactionsTextForLoc = (reportData: string, location: string) => {
    let transactionsInMonth = '';

    reportData = this.cleanUpPageOfText(reportData);
    let reportSansMetaData = this.cleanEmptySpacesFromText(reportData);

    if (reportSansMetaData.search(location) < 0) {
      return [];
    }

    reportSansMetaData = reportSansMetaData.substring(reportSansMetaData.search(location));
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
      if (outcome === 'income') payeePayer = 'Francois Rentals, LLC.';
      if (outcome === 'expense') payeePayer = 'Service-Expense';
    }

    desc = this.cleanDescription(desc, payeePayer, balanceArray);

    return {
      balance: balanceArray,
      date: new Date(date),
      desc,
      location: loc,
      outcome,
      payeePayer,
    };
  };

  public updateBalance = (transaction: IPendingTransaction, ogBalance: number) => {
    if (transaction.outcome === 'expense') {
      if (transaction.balance.at(0) != (ogBalance - parseFloat(transaction.balance.at(1).replace(/,/g, ''))).toFixed(2)) {
        transaction.balance[0] = (ogBalance - parseFloat(transaction.balance.at(1).replace(/,/g, ''))).toFixed(2);
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
      .replaceAll(DOLLAR_PARENTHESIS_REGEX_PATTERN, '')
      .replaceAll(MM_YYYY_REGEX_PATTERN, '')
      .replaceAll(MM_DD_REGEX_PATTERN, '')
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
    const rgx = /page \d+ of \d/gi;
    return text.replaceAll(rgx, '');
  }

  private cleanDescription(desc: string, payeePayer: string, balanceArray: string[]) {
    return desc
      .replace(payeePayer, '')
      .replace(balanceArray.at(0) + balanceArray.at(1), '')
      .replaceAll(TRANSACTION_TYPE_REFERENCE_REGEX_PATTERN, '')
      .trim()
      .replace(/^-/, '');
  }

  private determineOutcome(payeePayer: string, ogBalance: number, balanceArray: string[], desc: string) {
    const isTransfer = payeePayer === 'Transfer' || desc.includes('Transfer');
    const isPayout = (payeePayer === PERSONAL || payeePayer === LLC) && +balanceArray[0].replace(',', '') === ogBalance;
    const outcome = isPayout ? 'payout' : isTransfer ? 'Transfer' : parseFloat(balanceArray[1].replace(/,/g, '')) >= ogBalance ? 'income' : 'expense';
    if (!outcome) {
      return '';
    }
    return outcome;
  }

  private findPayeePayer(desc: string, payeesPayers: { name: string }[]) {
    return payeesPayers.find(v => desc.includes(v.name))?.name;
  }

  private logError(item: string, desc: string) {
    logger.error(`${item} for: ${desc}`);
  }
}

export default DataTransformer;