import { AppDataSource } from '@databases';

/**
 * Connect to the test database.
 */
export const connectDatabase = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
};

/**
 * Close the database connection.
 */
export const closeDatabase = async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
};

/**
 * Clear all data from all tables in the test database.
 */
export const clearDatabase = async () => {
  if (!AppDataSource.isInitialized) {
    await connectDatabase();
  }

  const entities = AppDataSource.entityMetadatas;
  for (const entity of entities) {
    const repository = AppDataSource.getRepository(entity.name);
    await repository.query(`TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE;`);
  }
};
