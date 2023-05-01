import { logger } from '@utils/logger';
import { CARRINGTON, CITY_STATE, LLC, PARADIS, WELLES, PERSONAL } from '@utils/constants';

class Parser {
  public payeesPayers = [];
  public locations = [WELLES, PARADIS, CARRINGTON];
  public collectReportData(info: string, listOfPeople: any[]) {
    this.payeesPayers = listOfPeople;
    const allTransactions = [];

    this.locations.forEach(location => {
      allTransactions.push(...this.collectAllObjectsPerHouse(this.getTransactionsPerHouse(info, `${location} ${CITY_STATE}`), location));
    });

    return allTransactions;
  }
  private collectAllObjectsPerHouse(houseData: string | any[], loc: string) {
    const totalTransactions = [];
    let ogBalance = 0;

    for (let i = 0; i < houseData.length; i += 2) {
      const transaction = this.getObjectFromData(loc, ogBalance, houseData[i], houseData[i + 1].trim());
      ogBalance = parseFloat(transaction.balance[1].replace(/,/g, ''));
      totalTransactions.push(transaction);
    }

    return totalTransactions;
  }
  public getObjectFromData(loc: string, ogBalance: number, date: any, desc: any) {
    const currentYear = new Date().getFullYear();
    const d_mm_yyRegexPattern = /([1-9]|1[012])[- \/.](0?[1-9]|[12][0-9]|3[01])[- \/.](21|22)/gi;
    const mm_yyyyRegexPattern = /(0[1-9]|1[012])[- \/.] ?(20)2[1-4]/gi;
    let payeePayer = this.payeesPayers.find(v => desc.includes(v.name))?.name; // extract Payee / Payer
    const isPayout = payeePayer === PERSONAL || payeePayer === LLC;

    const scrubbedDesc = desc
      .replaceAll(d_mm_yyRegexPattern, '')
      .replaceAll(mm_yyyyRegexPattern, '')
      .replaceAll(currentYear, '')
      .replaceAll(currentYear - 1, '');

    const balanceArray = scrubbedDesc.match(/-?\d{1,3}(,\d{3})*(\.\d{2})/gi);

    if (!balanceArray || balanceArray.length < 2) {
      this.#_logError('balanceArray', desc);
      throw new Error(`balanceArray is bad for: ${desc}`);
    }

    const outcome = isPayout ? 'payout' : parseFloat(balanceArray[1].replace(/,/g, '')) >= ogBalance ? 'income' : 'expense';

    if (!outcome) {
      this.#_logError('outcome', desc);
      throw new Error(`Outcome is missing for: ${desc}`);
    }
    if (!payeePayer) {
      if (outcome === 'income') payeePayer = 'Francois Rentals, LLC.';
      else {
        this.#_logError('payeePayer', desc);
        throw new Error(`payeePayer is missing for: ${desc}`);
      }
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
  public getTransactionsPerHouse(info, location) {
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

    transactionsInMonth = this.#findTransactionsInMonth(cleanedUp, firstLineMatch, trueLastLineMatch);
    transactionsInMonth = this.#cleanUpHeadersFromText(transactionsInMonth);

    return transactionsInMonth
      .split(dateRegex)
      .filter(w => w)
      .filter(w => w !== '/');
  }
  #cleanUpHeadersFromText(
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
  #findTransactionsInMonth(cleanedUp: any, firstLineMatch: string, lastLineMatch: string) {
    return cleanedUp.substring(cleanedUp.indexOf(firstLineMatch) + firstLineMatch.length, cleanedUp.indexOf(lastLineMatch));
  }
  #_logError(item: string, desc: string) {
    logger.error(`${item} is bad for: ${desc}`);
  }
}

export default Parser;
