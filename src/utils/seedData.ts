import 'reflect-metadata';
import fs from 'fs/promises';
import path from 'path';
import { AppDataSource } from '@databases';
import { Property } from '@models/property.pg_model';

interface OwnerPropertyJson {
  id: string; // -> maps to Property.externalId
  attributes: {
    raw_display_name: string; // -> maps to Property.displayName
  };
  relationships: {
    address: {
      attributes: {
        full: string; // -> maps to Property.fullAddress
      };
    };
    monthly_costs: {
      management_fee?: number;
      mortgage?: number;
      sewer?: number;
      water?: number;
      trash?: number;
      gas?: number;
    };
  };
}

async function seedProperties() {
  console.log('--- Seeding Properties ---');
  const propertyRepository = AppDataSource.getRepository(Property);

  const filePath = path.join(__dirname, '../holdings/data/properties/owner_properties.json');
  const rawData = await fs.readFile(filePath, 'utf-8');
  const propertiesData: OwnerPropertyJson[] = JSON.parse(rawData);

  for (const propData of propertiesData) {
    try {
      // Use externalId to find if the property already exists (idempotent)
      let property = await propertyRepository.findOne({ where: { externalId: propData.id } });

      if (property) {
        console.log(`[UPDATE] Property ${propData.attributes.raw_display_name} already exists. Updating...`);
      } else {
        console.log(`[INSERT] Creating new property: ${propData.attributes.raw_display_name}`);
        property = new Property();
        property.externalId = propData.id;
      }

      // Map data from JSON to the entity
      property.name = propData.attributes.raw_display_name;
      property.address = propData.relationships.address.attributes.full;
      property.managementFee = propData.relationships.monthly_costs.management_fee ?? null;
      property.mortgage = propData.relationships.monthly_costs.mortgage ?? null;
      property.sewer = propData.relationships.monthly_costs.sewer ?? null;
      property.water = propData.relationships.monthly_costs.water ?? null;
      property.trash = propData.relationships.monthly_costs.trash ?? null;
      property.gas = propData.relationships.monthly_costs.gas ?? null;

      await propertyRepository.save(property);
    } catch (error) {
      console.error(`  [ERROR] Failed to process property ${propData.id}:`, error);
    }
  }

  console.log('\n--- Finished Seeding Properties ---');
}

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection initialized.');

    await seedProperties();

    console.log('\nProperty data loaded successfully!');
  } catch (error) {
    console.error('\nError during property loading process:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed.');
    }
  }
}

// To run this script directly: `ts-node src/utils/loadProperties.ts`
if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
