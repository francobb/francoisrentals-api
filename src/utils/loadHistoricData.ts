// src/utils/dataLoader.ts
import 'reflect-metadata'; // Required for TypeORM
import fs from 'fs/promises';
import path from 'path';
import { AppDataSource } from '@databases';
import { Property } from '@models/property.pg_model';
import { Transaction } from '@models/transactions.pg_model';

// Assumes transaction JSONs have a `propertyId` that maps to Property.externalId
interface TransactionJson {
  id: string;
  propertyId: string;
  postedOn: string; // Corrected from 'date'
  amount: number;
  description: string;
  type: string; // Corrected from 'transaction_type'
  partyName: string; // Corrected from 'payee_payer'
  partyId: string; // Added to capture this useful ID
}

async function getAllJsonFiles(dir: string, exclude: string[] = []): Promise<string[]> {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map(async dirent => {
      const res = path.resolve(dir, dirent.name);
      if (exclude.some(e => res.includes(e))) {
        return [];
      }
      return dirent.isDirectory() ? getAllJsonFiles(res, exclude) : res.endsWith('.json') ? [res] : [];
    }),
  );
  return Array.prototype.concat(...files);
}

// src/utils/loadHistoricData.ts
async function loadHistoricalTransactions() {
  console.log('--- Loading Historical Transaction Data ---');
  const propertyRepository = AppDataSource.getRepository(Property);
  const transactionRepository = AppDataSource.getRepository(Transaction);

  const dataDir = path.join(__dirname, '../holdings/data');
  const transactionFiles = await getAllJsonFiles(dataDir, ['owner_properties.json']);

  console.log(
    'Transaction files to process:',
    transactionFiles.map(f => path.basename(f)),
  );

  for (const filePath of transactionFiles) {
    console.log(`\nProcessing ${path.relative(dataDir, filePath)}...`);
    const rawData = await fs.readFile(filePath, 'utf-8');
    const transactionsData: TransactionJson[] = JSON.parse(rawData);

    for (const transData of transactionsData) {
      try {
        // 1. Find the parent Property using `propertyId`.
        const property = await propertyRepository.findOne({
          where: { externalId: transData.propertyId },
        });

        if (!property) {
          console.warn(`  [SKIP] Property with externalId '${transData.propertyId}' not found for transaction '${transData.id}'.`);
          continue;
        }

        // 2. Check if the Transaction already exists to ensure idempotency.
        const existingTransaction = await transactionRepository.findOne({
          where: { externalId: transData.id },
        });

        if (existingTransaction) {
          continue; // Skip if already loaded
        }

        // 3. Create and save the new transaction record using the correct fields.
        const newTransaction = new Transaction();
        newTransaction.externalId = transData.id;
        newTransaction.postedOn = new Date(`${transData.postedOn}T00:00:00`);
        newTransaction.amount = transData.amount;
        newTransaction.description = transData.description;
        newTransaction.type = transData.type; // Corrected
        newTransaction.partyName = transData.partyName; // Corrected
        newTransaction.partyId = transData.partyId;
        newTransaction.property = property; // Link to the property

        await transactionRepository.save(newTransaction);
      } catch (error) {
        console.error(`  [ERROR] Failed to process transaction ${transData.id}:`, error);
      }
    }
    console.log(`Finished processing ${path.relative(dataDir, filePath)}`);
  }
  console.log('\n--- Finished Loading Historical Transactions ---');
}
// Run the loader
async function runLoader() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection initialized.');

    await loadHistoricalTransactions();

    console.log('\nTransaction data loaded successfully!');
  } catch (error) {
    console.error('\nError during data loading process:', error);
    throw error; // Rethrow to ensure the process exits with an error code
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed.');
    }
  }
}

// This allows the script to be run directly from the command line: `ts-node src/utils/loadHistoricData.ts`
if (require.main === module) {
  runLoader()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runLoader };
