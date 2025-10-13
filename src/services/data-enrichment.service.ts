import { AppDataSource } from '@/databases';
import { Occupancy } from '@/models/occupancy.pg_model';
import { Transaction } from '@/models/transactions.pg_model';
import { logger } from '@/utils/logger';
import { IsNull, Like, Not, Repository } from 'typeorm';

class DataEnrichmentService {
  private transactionRepository: Repository<Transaction> = AppDataSource.getRepository(Transaction);
  private occupancyRepository: Repository<Occupancy> = AppDataSource.getRepository(Occupancy);

  /**
   * Updates existing Occupancy records with a tenantId by parsing rent payment transactions.
   */
  public async linkOccupanciesToTenants(): Promise<{ updated: number; notFound: number; alreadyLinked: number }> {
    // 1. Find all occupancies that are missing a tenantId
    const occupanciesToUpdate = await this.occupancyRepository.find({
      where: { tenantId: IsNull() },
      relations: ['unit', 'unit.property'], // We need the unit and property info to find a match
    });

    if (occupanciesToUpdate.length === 0) {
      logger.info('No occupancies found that need a tenant link.');
      return { updated: 0, notFound: 0, alreadyLinked: 0 };
    }

    let updatedCount = 0;
    let notFoundCount = 0;

    // 2. Find all relevant rent payment transactions
    const rentTransactions = await this.transactionRepository.find({
      where: {
        description: Like('%- Rent'),
        partyId: Not(IsNull()),
      },
      order: { postedOn: 'DESC' }, // Process most recent first
    });

    // 3. Iterate through each occupancy that needs a tenant
    for (const occupancy of occupanciesToUpdate) {
      if (!occupancy.unit || !occupancy.unit.property) {
        notFoundCount++;
        logger.warn(`Skipping occupancy ${occupancy.id} because it is missing unit or property relations.`);
        continue;
      }

      // 4. Find a transaction that matches this occupancy's unit name and property
      let foundMatch = false;
      for (const tx of rentTransactions) {
        const unitNameFromTx = tx.description.split(' - ')[0].trim();
        if (tx.propertyId === occupancy.unit.property.externalId && unitNameFromTx === occupancy.unit.name) {
          // 5. We found a match! Update the occupancy record with the tenant's ID.
          occupancy.tenantId = tx.partyId;
          await this.occupancyRepository.save(occupancy);
          updatedCount++;
          logger.info(`Successfully linked occupancy for unit "${occupancy.unit.name}" to tenant ${tx.partyId}`);
          foundMatch = true;
          break; // Move to the next occupancy
        }
      }

      if (!foundMatch) {
        notFoundCount++;
        logger.warn(`Could not find a matching rent transaction for unit "${occupancy.unit.name}"`);
      }
    }

    return { updated: updatedCount, notFound: notFoundCount, alreadyLinked: 0 };
  }
}

export default DataEnrichmentService;
