import { logger } from '@utils/logger';

class Parser {
  public payeesPayers = [];

  // public parsePdf(pdf: string) {}
  public collectReportData(info: string, listOfPeople: any[]) {
    this.payeesPayers = listOfPeople;

    // find 212 DATA
    const wellesData = this.getTransactionsPerHouse(info, '');

    // find 23 DATA
    const paradisData = this.getTransactionsPerHouse(info, '23 Paradis Avenue Woonsocket, RI');

    // const carringtonData = getTransactionsPerHouse(info, '346 Carrington Avenue Woonsocket');

    // const carringtonData = getTransactionsPerHouse(info, '346 Carrington Avenue Woonsocket');

    if (paradisData) {
      return [...this.collectAllObjectsPerHouse(wellesData, '212 Welles St'), ...this.collectAllObjectsPerHouse(paradisData, '23 Paradis Ave')];
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

    /*
      TODO: MOVE THIS To An API
     */

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
      this._logError('outcome', desc);
      throw new Error(`Outcome is missing for: ${desc}`);
    }
    if (!payeePayer) {
      if (outcome === 'income') payeePayer = 'Francois Rentals, LLC.';
      else {
        this._logError('payeePayer', desc);
        throw new Error(`payeePayer is missing for: ${desc}`);
      }
    }
    if (!balanceArray || balanceArray.length < 2) {
      this._logError('balanceArray', desc);
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

  private getTransactionsPerHouse(info, location) {
    let item = '';
    const [first_line, last_line] = ['Beginning Cash Balance as of', 'Ending Cash Balance'];
    const first_column = 'Date';
    const regex = /(\d{1,4}([.\-/])\d{1,2}([.\-/])\d{4})/gi;
    const cleanedUp = info
      .replaceAll('\n', ' ')
      .split('\n')
      .filter(w => w)
      .toString();

    if (location) {
      item = cleanedUp.substring(cleanedUp.search(location)).split(last_line)[0]; //cleanup "\n"
      if (item.startsWith(location))
        return item
          .slice(item.search(first_column))
          .split(first_line)[1]
          .trim()
          .split(regex)
          .filter(w => w)
          .filter(w => w !== '/')
          .slice(2); // Start at Columns (DATE)
    }

    item = cleanedUp.substring(cleanedUp.search(first_line)).split(last_line)[0];

    return item
      .slice(0)
      .split(first_line)[1]
      .trim()
      .split(regex)
      .filter(w => w)
      .filter(w => w !== '/')
      .slice(2);
  }

  private _logError(item: string, desc: string) {
    logger.error(`${item} is bad for: ${desc}`);
  }
}

export default Parser;
