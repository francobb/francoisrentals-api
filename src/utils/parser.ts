import { logger } from '@utils/logger';

class Parser {
  public payeesPayers = [];
  public locations = ['212 Welles Street', '23 Paradis Avenue', '346 Carrington Avenue'];

  // public parsePdf(pdf: string) {}
  public collectReportData(info: string, listOfPeople: any[]) {
    this.payeesPayers = listOfPeople;

    // find 212 DATA
    const wellesData = this.getTransactionsPerHouse(info, '212 Welles Street');
    // find 23 DATA
    const paradisData = this.getTransactionsPerHouse(info, '23 Paradis Avenue Woonsocket, RI');

    const carringtonData = this.getTransactionsPerHouse(info, '346 Carrington Avenue Woonsocket, RI');

    if (paradisData) {
      return [
        ...this.collectAllObjectsPerHouse(wellesData, '212 Welles St'),
        ...this.collectAllObjectsPerHouse(paradisData, '23 Paradis Ave'),
        ...this.collectAllObjectsPerHouse(carringtonData, '346 Carrington Ave'),
      ];
    } else return this.collectAllObjectsPerHouse(wellesData, '212 Welles St');
  }

  private collectAllObjectsPerHouse(houseData: string | any[], loc: string) {
    const totalTransactions = [];
    let ogBalance = 0;

    for (let i = 0; i < houseData.length; i += 2) {
      const transactions = this.getObjectFromData(loc, ogBalance, houseData[i], houseData[i + 1].trim());
      ogBalance = parseFloat(transactions.balance[1].replace(/,/g, ''));

      totalTransactions.push(transactions);
    }

    return totalTransactions;
  }

  private getObjectFromData(loc: string, ogBalance: number, date: any, desc: any) {
    // remove year
    const currentYear = new Date().getFullYear();
    const d_mm_yyRegexPattern = /^([1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](21|22)/gi;
    const mm_yyyyRegexPattern = /(0[1-9]|1[012])[- \/.] ?(20)2[1-4]/gi;

    let payeePayer = this.payeesPayers.find(v => desc.includes(v.name))?.name; // extract Payee / Payer

    const balanceArray = desc
      .replaceAll(d_mm_yyRegexPattern, '')
      .replaceAll(mm_yyyyRegexPattern, '')
      .replaceAll(currentYear, '')
      .replaceAll(currentYear - 1, '')
      .match(/-?\d{1,3}(,\d{3})*(\.\d{2})/gi); ///\$\d+(?:\.\d{2})?/gi

    const isPayout = payeePayer === 'Buteau Francois, Jr.' || payeePayer === 'Francois Rentals, LLC.';
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
    if (!balanceArray || balanceArray.length < 2) {
      this.#_logError('balanceArray', desc);
      throw new Error(`balanceArray is bad for: ${desc}`);
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

  getTransactionsPerHouse(info, location = '212 Welles Street') {
    // 4: trim header from descriptions

    let transactionsInMonth = '';

    const [first_line, last_line] = [/Beginning Cash Balance as of \d{2}\/\d{2}\/\d{4}\d+\.\d{2}/gi, /Ending Cash Balance\d\.\d{2}/gi];
    const dateRegex = /(?<! - )\b(\d{1,4}([.\-/])\d{1,2}([.\-/])\d{4})/gi;

    info = this.#cleanUpPageOfText(info);
    let cleanedUp = info
      .replaceAll('\n', ' ')
      .split('\n')
      .filter(w => w)
      .toString();

    cleanedUp = cleanedUp.substring(cleanedUp.search(location));

    const firstLineMatch = first_line.exec(cleanedUp)[0];
    const lastLineMatch = last_line.exec(cleanedUp)[0];

    transactionsInMonth = this.#findTransactionsInMonth(cleanedUp, firstLineMatch, lastLineMatch);
    transactionsInMonth = this.#cleanUpHeadersFromText(transactionsInMonth);

    return transactionsInMonth
      .split(dateRegex)
      .filter(w => w)
      .filter(w => w !== '/');
    // .slice(2);
  }

  #cleanUpHeadersFromText(
    text,
    ttr: Array<string | RegExp> = ['DatePayee / PayerTypeReferenceDescriptionIncomeExpenseBalance', /Please Remit Balance Due\d\.\d{2}/gi],
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
