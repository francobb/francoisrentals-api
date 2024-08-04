import { FilterQuery } from 'mongoose';
import { ITransaction } from '@interfaces/transactions.interface';

class SearchQueryBuilder {
  private date?: { from: Date; to: Date };
  private location?: string;
  private outcome?: string;
  private payeePayer?: string;

  withDate(date?: { from: Date; to: Date }): SearchQueryBuilder {
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
      filter.date = {
        $gte: this.date.from,
        $lte: this.date.to,
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
