import { FilterQuery } from 'mongoose';
import { ITransaction } from '@interfaces/transactions.interface';
import { getLastDayOfMonth } from '@utils/util';

class SearchQueryBuilder {
  private date?: { month: number; year: number };
  private location?: string;
  private outcome?: string;
  private payeePayer?: string;

  withDate(date?: { month: number; year: number }): SearchQueryBuilder {
    this.date = date;
    return this;
  }

  withLocation(location?: string): SearchQueryBuilder {
    this.location = location;
    return this;
  }

  withOutcome(outcome?: string): SearchQueryBuilder {
    this.outcome = outcome;
    return this;
  }

  withPayeePayer(payeePayer?: string): SearchQueryBuilder {
    this.payeePayer = payeePayer;
    return this;
  }

  build(): FilterQuery<any> {
    const filter: FilterQuery<ITransaction> = {};

    if (this.date) {
      const startOfMonth = new Date(`${this.date.year}-${this.date.month.toString().padStart(2, '0')}-01T00:00:00`);
      const endOfMonth = new Date(
        `${this.date.year}-${this.date.month.toString().padStart(2, '0')}-${getLastDayOfMonth(this.date.year, this.date.month)}T23:59:59`,
      );

      filter.date = {
        $gte: startOfMonth,
        $lte: endOfMonth,
      };
    }

    if (this.location) {
      filter.location = this.location;
    }

    if (this.outcome) {
      filter.outcome = this.outcome;
    }

    if (this.payeePayer) {
      filter.payeePayer = this.payeePayer;
    }

    return filter;
  }
}

export default SearchQueryBuilder;
