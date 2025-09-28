import axios from 'axios';
import 'reflect-metadata';
import { AppDataSource } from '@databases';
import { In } from 'typeorm';
import { Transaction } from '@models/transactions.pg_model';
import { Property } from '@models/property.pg_model';
import { Tenant } from '@models/tenant.pg_model';
import { Unit } from '@models/unit.pg_model';
import { Occupancy } from '@models/occupancy.pg_model';
import { TenantCharge } from '@models/tenant-charge.pg_model';
import { logger } from '@utils/logger';
import { EMAIL_ADDRESS, EMAIL_PASSWORD, AUTHENTICITY_TOKEN, COOKIES } from '@config';

const userEmail = EMAIL_ADDRESS;
const userPassword = EMAIL_PASSWORD;
const authenticityToken = AUTHENTICITY_TOKEN;
const cookies = COOKIES;

// --- Type Definitions ---
interface ApiTransaction {
  id: string;
  propertyId: string;
  postedOn: string;
  amount: number;
  description: string;
  type: string;
  partyName: string;
  partyId: string;
}

interface ApiTenantCharge {
  id: string;
  amount: number;
  balance: number;
  occurredOn: string;
  propertyId: string;
}

interface ApiProperty {
  id: string;
  attributes: {
    raw_display_name: string;
  };
  relationships: {
    address: JsonApiRelationship<{ full: string }>;
    units: { data: JsonApiUnit[] }; // Units are in a 'data' array
  };
}

interface JsonApiRelationship<T> {
  id: string;
  type: string;
  attributes: T;
  relationships?: any; // For nested relationships
}

interface JsonApiUnit {
  id: string;
  attributes: {
    name: string;
    occupied: boolean;
  };
  relationships: {
    current_occupancy: { data: JsonApiOccupancy }; // Occupancy is in a 'data' object
  };
}

interface JsonApiOccupancy {
  id: string;
  attributes: {
    move_in: string;
    total_rent_and_subsidy: number;
  };
  relationships: {
    lease: { data: JsonApiLease }; // Lease is in a 'data' object
  };
}

interface JsonApiLease {
  id: string;
  attributes: {
    end_on: string;
  };
}

interface ScraperTaskOptions {
  historic?: boolean;
  year?: number;
}

interface TenantChargeScraperTaskOptions {
  startDate?: string;
  endDate?: string;
}

export async function _authenticateAndGetCookie(): Promise<string> {
  if (!authenticityToken || !cookies) {
    throw new Error('Missing AUTHENTICITY_TOKEN or COOKIES in config. Please add them to your .env file.');
  }

  try {
    logger.info('[Scraper Auth] Attempting to re-authenticate with provided token and cookies...');
    const loginPayload = `authenticity_token=${encodeURIComponent(
      authenticityToken,
    )}&require_reverification=true&user%5Bemail%5D=${encodeURIComponent(userEmail)}&user%5Bpassword%5D=${encodeURIComponent(
      userPassword,
    )}&commit=Log+in`;

    const response = await axios.post('https://rpmri001.appfolio.com/oportal/users/log_in', loginPayload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
        Cookie: cookies,
        Referer: 'https://rpmri001.appfolio.com/oportal/users/log_in',
        Origin: 'https://rpmri001.appfolio.com',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
      },
      maxRedirects: 0,
      validateStatus: status => status === 302,
    });

    const newCookie = response.headers['set-cookie']?.join('; ');
    if (!newCookie) {
      logger.warn('[Scraper Auth] Authentication POST did not return a new cookie. Using original cookies.');
      return cookies;
    }
    logger.info('[Scraper Auth] Authentication successful, a new session cookie was received.');
    return newCookie;
  } catch (error: any) {
    const errorDetails = error.response ? `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}` : error.message;
    logger.error(`[Scraper Task] Error during authentication: ${errorDetails}`);
    throw new Error('Failed to authenticate with Appfolio.');
  }
}

export async function authenticateAndGetCookie(): Promise<string> {
  if (!authenticityToken || !cookies) {
    throw new Error('Missing AUTHENTICITY_TOKEN or COOKIES in .env file');
  }

  try {
    // Perform the POST request to log in
    const loginPayload = `authenticity_token=${encodeURIComponent(
      authenticityToken,
    )}&require_reverification=true&user%5Bemail%5D=${encodeURIComponent(userEmail)}&user%5Bpassword%5D=${encodeURIComponent(
      userPassword,
    )}&commit=Log+in`;

    const response = await axios.post(
      'https://rpmri001.appfolio.com/oportal/users/log_in',
      // `authenticity_token=${authenticityToken}&require_reverification=true&user%5Bemail%5D=buteaufrancois%40gmail.com&user%5Bpassword%5D=baller12&commit=Log+in`,
      loginPayload,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
          Cookie: cookies,
          Referer: 'https://rpmri001.appfolio.com/oportal/users/log_in',
          Origin: 'https://rpmri001.appfolio.com',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-Fetch-User': '?1',
        },
        maxRedirects: 0, // Avoid following redirects
        validateStatus: status => status === 302, // Handle redirect manually
      },
    );

    // Extract the set-cookie header
    const cookie = response.headers['set-cookie']?.join('; ');
    if (!cookie) throw new Error('Authentication failed, no cookie received');

    return cookie;
  } catch (error) {
    console.error('Error during authentication:', error);
    throw error;
  }
}

export async function fetchTransactionPage(cookie: string, startDate: string, endDate: string, limit = 100, offset = 0): Promise<ApiTransaction[]> {
  try {
    const response = await axios.get('https://rpmri001.appfolio.com/oportal/api/owner_transactions', {
      params: { start_on: startDate, end_on: endDate, limit: limit.toString(), offset: offset.toString() },
      headers: {
        Cookie: cookie,
      },
    });
    return response.data;
  } catch (error: any) {
    logger.error(`[Scraper Task] Error fetching transaction page at offset ${offset}:`, error.message);
    throw error;
  }
}

async function fetchTenantChargesPage(cookie: string, startDate: string, endDate: string, limit = 25, offset = 0): Promise<ApiTenantCharge[]> {
  try {
    const response = await axios.get('https://rpmri001.appfolio.com/oportal/api/tenant_charges', {
      params: { start_on: startDate, end_on: endDate, balance_as_of: endDate, limit: limit.toString(), offset: offset.toString() },
      headers: {
        Cookie: cookie,
      },
    });
    return response.data;
  } catch (error: any) {
    logger.error(`[Scraper Task] Error fetching tenant charges page at offset ${offset}:`, error.message);
    throw error;
  }
}

async function fetchOwnerProperties(cookie: string): Promise<ApiProperty[]> {
  try {
    const response = await axios.get('https://rpmri001.appfolio.com/oportal/api/owner_properties', {
      headers: {
        Cookie: cookie,
      },
    });
    return response.data;
  } catch (error: any) {
    logger.error(`[Scraper Task] Error fetching owner properties:`, error.message);
    throw error;
  }
}

async function insertTransactions(transactions: ApiTransaction[]): Promise<void> {
  const transactionRepository = AppDataSource.getRepository(Transaction);
  const propertyRepository = AppDataSource.getRepository(Property);

  if (transactions.length === 0) {
    logger.info('[Scraper Task] No transactions to insert.');
    return;
  }

  const incomingTransactionIds = transactions.map(t => t.id);
  const existingTransactions = await transactionRepository.find({
    where: { externalId: In(incomingTransactionIds) },
    select: ['externalId'],
  });
  const existingTransactionIds = new Set(existingTransactions.map(t => t.externalId));

  const newApiTransactions = transactions.filter(t => !existingTransactionIds.has(t.id));

  if (newApiTransactions.length === 0) {
    logger.info('[Scraper Task] All fetched transactions already exist in the database.');
    return;
  }

  logger.info(`[Scraper Task] Found ${newApiTransactions.length} new transactions to insert.`);

  const propertyIds = [...new Set(newApiTransactions.map(t => t.propertyId))];
  const properties = await propertyRepository.find({
    where: { externalId: In(propertyIds) },
  });
  const propertyMap = new Map(properties.map(p => [p.externalId, p]));

  const transactionsToSave: Partial<Transaction>[] = [];
  for (const transData of newApiTransactions) {
    const property = propertyMap.get(transData.propertyId);
    if (!property) {
      logger.warn(`[Scraper Task] [SKIP] Property with externalId '${transData.propertyId}' not found for new transaction '${transData.id}'.`);
      continue;
    }

    transactionsToSave.push({
      externalId: transData.id,
      postedOn: safeCreateDate(transData.postedOn),
      amount: transData.amount,
      description: transData.description,
      type: transData.type,
      partyName: transData.partyName,
      partyId: transData.partyId,
      property: property,
    });
  }

  if (transactionsToSave.length > 0) {
    try {
      await transactionRepository.save(transactionsToSave);
      logger.info(`[Scraper Task] Successfully bulk saved ${transactionsToSave.length} new transactions.`);
    } catch (error: any) {
      logger.error(`[Scraper Task] [ERROR] Failed to bulk save new transactions:`, error);
    }
  }
}

async function insertTenantCharges(charges: ApiTenantCharge[]): Promise<void> {
  const tenantChargeRepository = AppDataSource.getRepository(TenantCharge);
  const propertyRepository = AppDataSource.getRepository(Property);

  for (const chargeData of charges) {
    try {
      if (!chargeData.id) {
        logger.warn(`[Scraper Task] [SKIP] Received a tenant charge record without an ID. Skipping.`);
        continue;
      }

      const property = await propertyRepository.findOne({ where: { externalId: chargeData.propertyId } });
      if (!property) {
        logger.warn(`[Scraper Task] [SKIP] Property with externalId '${chargeData.propertyId}' not found for tenant charge '${chargeData.id}'.`);
        continue;
      }

      // Use upsert to either insert a new charge or update an existing one's balance.
      await tenantChargeRepository.upsert(
        {
          externalId: chargeData.id,
          amount: chargeData.amount,
          balance: chargeData.balance,
          occurredOn: safeCreateDate(chargeData.occurredOn),
          propertyId: property.id, // Use the foreign key ID instead of the full entity
        },
        ['externalId'], // Conflict target: if a charge with this externalId exists, it will be updated.
      );
    } catch (error: any) {
      logger.error(`[Scraper Task] [ERROR] Failed to save tenant charge ${chargeData.id}:`, error);
    }
  }
}

async function insertOrUpdateProperties(properties: ApiProperty[]): Promise<void> {
  const propertyRepository = AppDataSource.getRepository(Property);
  const unitRepository = AppDataSource.getRepository(Unit);
  const occupancyRepository = AppDataSource.getRepository(Occupancy);
  const tenantRepository = AppDataSource.getRepository(Tenant);

  for (const propData of properties) {
    try {
      const propertyName = propData.attributes?.raw_display_name;
      const propertyAddress = propData.relationships?.address?.attributes?.full;

      if (!propertyName || !propertyAddress) {
        logger.warn(`[Scraper Task] [SKIP] Property with externalId '${propData.id}' is missing name or address. Skipping.`);
        continue;
      }

      let property = await propertyRepository.findOne({ where: { externalId: propData.id } });

      if (!property) {
        property = propertyRepository.create({
          externalId: propData.id,
          name: propertyName,
          address: propertyAddress,
        });
      } else {
        property.name = propertyName;
        property.address = propertyAddress;
      }
      await propertyRepository.save(property);

      const units = propData.relationships?.units?.data || [];
      for (const unitData of units) {
        if (!unitData.id || !unitData.attributes?.name) {
          logger.warn(`[Scraper Task] [SKIP] Unit for property '${propData.id}' is missing an ID or name. Skipping.`);
          continue;
        }

        let unit = await unitRepository.findOne({
          where: { externalId: unitData.id },
          relations: ['currentOccupancy'],
        });

        if (!unit) {
          unit = unitRepository.create({
            externalId: unitData.id,
            name: unitData.attributes.name.trim(),
            occupied: unitData.attributes.occupied,
            property: property,
          });
        } else {
          unit.name = unitData.attributes.name.trim();
          unit.occupied = unitData.attributes.occupied;
          unit.property = property;
        }
        await unitRepository.save(unit);

        const occupancyData = unitData.relationships?.current_occupancy?.data;
        const existingOccupancy = unit.currentOccupancy;

        // If an occupancy existed but is now gone from the API, remove it from our DB
        if (existingOccupancy) {
          if (!occupancyData || existingOccupancy.externalId !== occupancyData.id) {
            await occupancyRepository.remove(existingOccupancy);
          }
        }

        // If a new or updated occupancy exists in the API, create or update it
        if (occupancyData) {
          let occupancy = await occupancyRepository.findOne({ where: { externalId: occupancyData.id } });
          const leaseData = occupancyData.relationships?.lease?.data;
          const leaseEndDate = safeCreateDate(leaseData?.attributes.end_on);
          let tenant: Tenant | null = null;

          // --- Tenant Association (Heuristic due to API limitations) ---
          const recentRentTransaction = await AppDataSource.getRepository(Transaction).findOne({
            where: { property: { id: property.id }, type: 'cashIn' },
            order: { postedOn: 'DESC' },
          });

          if (recentRentTransaction?.partyName) {
            tenant = await tenantRepository.findOne({ where: { name: recentRentTransaction.partyName } });
            if (!tenant) {
              tenant = tenantRepository.create({ name: recentRentTransaction.partyName });
              await tenantRepository.save(tenant);
            }
          }

          if (!occupancy) {
            occupancy = occupancyRepository.create({
              externalId: occupancyData.id,
              moveIn: safeCreateDate(occupancyData.attributes.move_in),
              rent: occupancyData.attributes.total_rent_and_subsidy,
              leaseEnd: leaseEndDate,
              unit: unit,
              tenant: tenant,
            });
          } else {
            occupancy.moveIn = safeCreateDate(occupancyData.attributes.move_in);
            occupancy.rent = occupancyData.attributes.total_rent_and_subsidy;
            occupancy.leaseEnd = leaseEndDate;
            occupancy.unit = unit;
            occupancy.tenant = tenant;
          }
          await occupancyRepository.save(occupancy);
        }
      }
    } catch (error: any) {
      logger.error(`[Scraper Task] [ERROR] Failed to save property ${propData.id}:`, error);
    }
  }
}

async function fetchAndProcessDateRange(sessionCookie: string, startDate: string, endDate: string): Promise<void> {
  const allTransactions: ApiTransaction[] = [];
  const recordsPerPage = 10;
  let offset = 0;
  let hasMorePages = true;

  logger.info(`[Scraper Task] --- Fetching owner transactions for ${startDate} - ${endDate} ---`);

  while (hasMorePages) {
    try {
      const transactionsPage = await fetchTransactionPage(sessionCookie, startDate, endDate, recordsPerPage, offset);
      logger.info(`[Scraper Task] Fetched ${transactionsPage.length} records (offset: ${offset}).`);

      if (transactionsPage.length > 0) {
        allTransactions.push(...transactionsPage);
        offset += recordsPerPage;
      } else {
        hasMorePages = false;
      }

      if (transactionsPage.length < recordsPerPage) {
        hasMorePages = false;
      }
    } catch (error: any) {
      logger.error(`[Scraper Task] Stopping fetch for ${startDate} - ${endDate} due to an error: ${error.message}`);
      hasMorePages = false; // Stop the loop on error
    }
  }

  logger.info(`[Scraper Task] Fetched a total of ${allTransactions.length} transactions. Processing for bulk insert...`);
  await insertTransactions(allTransactions);

  logger.info(`[Scraper Task] --- Completed fetching for ${startDate} - ${endDate} ---`);
}

/**
 * Formats a Date object into the MM/DD/YYYY string required by the Appfolio API.
 */
const formatDateForApi = (date: Date): string => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

/**
 * Safely creates a Date object from a string, returning null if the string is invalid.
 */
const safeCreateDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;
  const date = new Date(`${dateString}T00:00:00`);
  return isNaN(date.getTime()) ? null : date;
};

export const runScraperTask = async (options: ScraperTaskOptions = {}): Promise<void> => {
  const { historic = false, year } = options;
  const jobType = historic || year ? 'Historic' : 'Standard';

  const today = new Date();
  let startDate: Date;
  let endDate: Date = today;
  let logMessage: string;

  if (year) {
    // Case 1: A specific year is provided. Scrape the entire year.
    logMessage = `[Scraper Task] Scraping for specified year: ${year}`;
    startDate = new Date(year, 0, 1); // January 1st of the given year
    if (year === today.getFullYear()) {
      // If it's the current year, scrape up to today
      endDate = today;
    } else {
      // Otherwise, scrape the entire year
      endDate = new Date(year, 11, 31); // December 31st
    }
  } else if (historic) {
    // Case 2: 'historic' is true, but no year. Scrape the entire current year to date.
    logMessage = `[Scraper Task] Scraping current year to date (historic).`;
    startDate = new Date(today.getFullYear(), 0, 1); // January 1st of the current year
    endDate = today;
  } else {
    // Case 3: Default behavior. Scrape the current month to date.
    logMessage = `[Scraper Task] Scraping current month to date (default).`;
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    endDate = today;
  }

  logger.info(`[Scraper Task] Starting ${jobType} transaction scrape...`);
  logger.info(logMessage);

  const formattedStartDate = formatDateForApi(startDate);
  const formattedEndDate = formatDateForApi(endDate);
  logger.info(`[Scraper Task] Processing date range: ${formattedStartDate} to ${formattedEndDate}`);

  try {
    logger.info('[Scraper Task] Authenticating with Appfolio...');
    const sessionCookie = await authenticateAndGetCookie();
    logger.info('[Scraper Task] Authentication successful.');

    await fetchAndProcessDateRange(sessionCookie, formattedStartDate, formattedEndDate);

    logger.info(`[Scraper Task] ${jobType} scraping process completed successfully!`);
  } catch (error: any) {
    logger.error(`[Scraper Task] A fatal error occurred during the ${jobType} scraping process:`, error);
    throw error;
  }
};

export const runPropertyScraperTask = async (): Promise<void> => {
  logger.info('[Property Scraper Task] Starting property scrape...');

  try {
    logger.info('[Property Scraper Task] Authenticating with Appfolio...');
    const sessionCookie = await authenticateAndGetCookie();
    logger.info('[Property Scraper Task] Authentication successful.');

    logger.info('[Property Scraper Task] Fetching owner properties...');
    const properties = await fetchOwnerProperties(sessionCookie);
    logger.info(`[Property Scraper Task] Fetched ${properties.length} properties. Inserting into DB...`);
    await insertOrUpdateProperties(properties);

    logger.info('[Property Scraper Task] Property scraping process completed successfully!');
  } catch (error: any) {
    logger.error('[Property Scraper Task] A fatal error occurred during the property scraping process:', error);
    throw error;
  }
};

export const runTenantChargeScraperTask = async (options: TenantChargeScraperTaskOptions): Promise<void> => {
  // Default to the current month-to-date if no dates are provided.
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const startDate = options.startDate || formatDateForApi(startOfMonth);
  const endDate = options.endDate || formatDateForApi(today);

  logger.info(`[Tenant Charge Scraper Task] Starting tenant charge scrape for ${startDate} - ${endDate}...`);

  try {
    logger.info('[Tenant Charge Scraper Task] Authenticating with Appfolio...');
    const sessionCookie = await authenticateAndGetCookie();
    logger.info('[Tenant Charge Scraper Task] Authentication successful.');

    const recordsPerPage = 25;
    let offset = 0;
    let hasMorePages = true;

    while (hasMorePages) {
      const tenantChargesPage = await fetchTenantChargesPage(sessionCookie, startDate, endDate, recordsPerPage, offset);

      if (tenantChargesPage.length > 0) {
        logger.info(`[Tenant Charge Scraper Task] Fetched ${tenantChargesPage.length} records (offset: ${offset}). Inserting into DB...`);
        await insertTenantCharges(tenantChargesPage);
        offset += tenantChargesPage.length;
      }

      if (tenantChargesPage.length < recordsPerPage) {
        hasMorePages = false;
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    logger.info(`[Tenant Charge Scraper Task] Tenant charge scraping process completed successfully!`);
  } catch (error: any) {
    logger.error('[Tenant Charge Scraper Task] A fatal error occurred during the tenant charge scraping process:', error);
    throw error;
  }
};
