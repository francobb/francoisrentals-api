// src/utils/cleanupDuplicateTransactions.ts
import { AppDataSource } from '@databases';

async function cleanupDuplicateTransactions() {
  try {
    await AppDataSource.initialize();

    // Delete duplicates keeping only the record with the lowest ID for each externalId
    const result = await AppDataSource.query(`
      DELETE FROM transactions
      WHERE id IN (
        SELECT id FROM (
          SELECT id,
          ROW_NUMBER() OVER (PARTITION BY  "externalId" ORDER BY id) as row_num
          FROM transactions
        ) t
        WHERE t.row_num > 1
      );
    `);

    console.log(`Cleaned up ${result[1]} duplicate transactions`);
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the cleanup
cleanupDuplicateTransactions()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
