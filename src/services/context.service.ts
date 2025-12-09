import { AppDataSource } from '@databases';
import { In, Between } from 'typeorm';
import { Property } from '@models/property.pg_model';
import { Tenant } from '@models/tenant.pg_model';
import { Transaction } from '@models/transactions.pg_model';
import { logger } from '@utils/logger';

type EnrichedTransaction = Transaction & { isLate?: boolean };
type ContextData = { dataDump: string; hint: string };

class ContextBuilderService {
  private propertyRepository = AppDataSource.getRepository(Property);
  private tenantRepository = AppDataSource.getRepository(Tenant);
  private transactionRepository = AppDataSource.getRepository(Transaction);

  public async buildContext(question: string): Promise<string> {
    logger.info(`[ContextBuilder] Building context for question: "${question}"`);

    const { dataDump, hint } = await this.recognizeEntitiesAndFetchData(question);

    return `
      ## Application Rules & Data Context
      ${hint}

      **Rule 1: The Source of Truth is Scraped Data.** All data originates from scraping AppFolio.
      **Rule 2: Tenant Name Linking.** A Tenant's name can ONLY be found in the 'partyName' field of a Transaction.
      **Rule 3: Debugging Starts with Data.** Most issues are data problems (missing scrapes), not code bugs.

      ---

      ### Data Dump
      ${dataDump}
    `;
  }

  private async recognizeEntitiesAndFetchData(question: string): Promise<ContextData> {
    const lowerCaseQuestion = question.toLowerCase();
    const isLatenessQuestion = lowerCaseQuestion.includes('late');

    const allTenants = await this.tenantRepository.find({ select: ['name'] });
    const mentionedTenantNames = this.findTenantsInQuestion(lowerCaseQuestion, allTenants);
    const mentionedYear = this.findYearInQuestion(lowerCaseQuestion);

    if (mentionedTenantNames.length > 0) {
      const tenantName = mentionedTenantNames[0];
      logger.info(`[ContextBuilder] Found mentioned tenant: ${tenantName}`);
      if (mentionedYear) {
        logger.info(`[ContextBuilder] Found mentioned year: ${mentionedYear}`);
      }

      const whereConditions: any = { partyName: tenantName };
      if (mentionedYear) {
        whereConditions.postedOn = Between(new Date(mentionedYear, 0, 1), new Date(mentionedYear, 11, 31, 23, 59, 59));
      }

      let transactions: EnrichedTransaction[] = await this.transactionRepository.find({
        where: whereConditions,
        order: { postedOn: 'DESC' },
      });

      let hint = '';
      if (isLatenessQuestion && transactions.length > 0) {
        logger.info('[ContextBuilder] Lateness question detected. Analyzing transactions...');
        transactions = this.analyzeTransactionLateness(transactions);
        hint = `**Hint for your current question: I have pre-analyzed the tenant's transactions and added an 'isLate' flag. To answer the question, count the number of transactions where 'isLate' is true.**`;
      }

      const dataDump = `
        **Relevant Transactions for ${tenantName}${mentionedYear ? ` in ${mentionedYear}` : ''}:**
        ${JSON.stringify(transactions, null, 2)}
      `;
      return { dataDump, hint };
    } else {
      logger.warn('[ContextBuilder] No specific entities found in question. Falling back to general data.');
      const properties = await this.propertyRepository.find({ take: 5 });
      const dataDump = `
        **General Data (No specific entities found in question):**
        **Sample Properties:**
        ${JSON.stringify(properties, null, 2)}
      `;
      return { dataDump, hint: '' };
    }
  }

  private analyzeTransactionLateness(transactions: Transaction[]): EnrichedTransaction[] {
    const monthMap: { [key: string]: number } = {
      january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
      july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
    };

    return transactions.map(t => {
      const enrichedTransaction: EnrichedTransaction = { ...t, isLate: false };
      if (t.type !== 'cashIn') return enrichedTransaction;

      const description = t.description.toLowerCase();
      const postedDate = new Date(t.postedOn);
      const postedMonth = postedDate.getUTCMonth() + 1;
      const postedDay = postedDate.getUTCDate();

      for (const monthName in monthMap) {
        if (description.includes(monthName)) {
          const rentMonth = monthMap[monthName];
          if (postedMonth > rentMonth || (postedMonth === rentMonth && postedDay > 1)) {
            enrichedTransaction.isLate = true;
            break;
          }
        }
      }
      return enrichedTransaction;
    });
  }

  private findTenantsInQuestion(question: string, allTenants: { name: string }[]): string[] {
    const foundTenants = new Set<string>();
    for (const tenant of allTenants) {
      if (tenant.name && question.includes(tenant.name.toLowerCase())) {
        foundTenants.add(tenant.name);
      }
    }
    return Array.from(foundTenants);
  }

  private findYearInQuestion(question: string): number | null {
    const yearMatch = question.match(/\b(20\d{2})\b/);
    if (yearMatch) return parseInt(yearMatch[0], 10);
    return null;
  }
}

export default ContextBuilderService;
