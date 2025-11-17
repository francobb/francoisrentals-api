import axios from 'axios';
import 'reflect-metadata';
import { AppDataSource } from '@databases';
import { In, LessThanOrEqual, Between, Not, IsNull } from 'typeorm';
import { Transaction } from '@models/transactions.pg_model';
import { Property } from '@models/property.pg_model';
import { Tenant } from '@models/tenant.pg_model';
import { Unit } from '@models/unit.pg_model';
import { Occupancy } from '@models/occupancy.pg_model';
import { OccupancySnapshot } from '@models/occupancy-snapshot.pg_model';
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
    units: JsonApiUnit[];
  };
}

interface JsonApiRelationship<T> {
  id: string;
  type: string;
  attributes: T;
  relationships?: any;
}

interface JsonApiUnit {
  id: string;
  attributes: {
    name: string;
    occupied: boolean;
  };
  relationships: {
    current_occupancy: JsonApiOccupancy;
  };
}

interface JsonApiOccupancy {
  id: string;
  attributes: {
    move_in: string;
    total_rent_and_subsidy: number;
  };
  relationships: {
    lease: JsonApiLease;
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

export async function authenticateAndGetCookie(): Promise<string | null> {
  if (!authenticityToken || !cookies) {
    logger.error('Missing AUTHENTICITY_TOKEN or COOKIES in .env file');
    return null;
  }
  try {
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
        'Sec-Fetch-User': '?1',
      },
      maxRedirects: 0,
      validateStatus: status => status === 302,
    });
    const cookie = response.headers['set-cookie']?.join('; ');
    if (!cookie) {
      logger.error('Authentication failed, no cookie received');
      return null;
    }
    return cookie;
  } catch (error) {
    console.error('Error during authentication:', error);
    return null;
  }
}

export async function fetchTransactionPage(cookie: string, startDate: string, endDate: string, limit = 100, offset = 0): Promise<ApiTransaction[]> {
  try {
    const response = await axios.get('https://rpmri001.appfolio.com/oportal/api/owner_transactions', {
      params: { start_on: startDate, end_on: endDate, limit: limit.toString(), offset: offset.toString() },
      headers: { Cookie: cookie },
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
      headers: { Cookie: cookie },
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
      headers: { Cookie: cookie },
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
  const properties = await propertyRepository.find({ where: { externalId: In(propertyIds) } });
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
  const occupancyRepository = AppDataSource.getRepository(Occupancy);
  const occupancySnapshotRepository = AppDataSource.getRepository(OccupancySnapshot);
  const transactionRepository = AppDataSource.getRepository(Transaction);
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

      let matchedOccupancy: Occupancy | null = null;

      const candidateOccupancies = await occupancyRepository.find({
        where: { unit: { property: { id: property.id } } },
        relations: ['tenant', 'unit'],
      });

      const occupanciesMatchingRent = candidateOccupancies.filter(occ => occ.rent && Math.abs(Number(occ.rent) - Number(chargeData.amount)) < 0.01);

      if (occupanciesMatchingRent.length === 1) {
        matchedOccupancy = occupanciesMatchingRent[0];
        logger.info(`[Scraper Task] Matched charge ${chargeData.id} to tenant '${matchedOccupancy.tenant.name}' via unique rent amount.`);
      } else if (occupanciesMatchingRent.length > 1) {
        // --- NEW: Historical Charge Match ---
        const recentMatchingCharge = await tenantChargeRepository.findOne({
          where: {
            propertyId: property.id,
            amount: chargeData.amount,
            tenantId: Not(IsNull()),
          },
          order: {
            occurredOn: 'DESC',
          },
        });

        if (recentMatchingCharge && recentMatchingCharge.tenantId) {
          const historicMatch = occupanciesMatchingRent.find(occ => occ.tenant?.id === recentMatchingCharge.tenantId);
          if (historicMatch) {
            matchedOccupancy = historicMatch;
            logger.info(`[Scraper Task] Matched charge ${chargeData.id} to tenant '${matchedOccupancy.tenant.name}' via historical charge analysis.`);
          }
        } else {
          // --- Fallback to Transaction Heuristic ---
          logger.warn(
            `[Scraper Task] [AMBIGUOUS] Found ${occupanciesMatchingRent.length} units with matching rent for charge ${chargeData.id}. Proceeding to transaction heuristic.`,
          );

          const chargeDate = safeCreateDate(chargeData.occurredOn);
          if (chargeDate) {
            const searchEndDate = new Date(chargeDate);
            const searchStartDate = new Date(chargeDate);
            searchStartDate.setDate(searchStartDate.getDate() - 45); // 45-day lookback window

            const tenantsToSearch = occupanciesMatchingRent.map(o => o.tenant).filter(Boolean);
            const tenantNamesToSearch = tenantsToSearch.map(t => t.name);

            if (tenantNamesToSearch.length > 0) {
              const relevantTransactions = await transactionRepository.find({
                where: {
                  property: { id: property.id },
                  type: 'cashIn',
                  partyName: In(tenantNamesToSearch),
                  postedOn: Between(searchStartDate, searchEndDate),
                },
              });

              const paymentsByTenant: { [tenantName: string]: number } = {};
              for (const name of tenantNamesToSearch) {
                paymentsByTenant[name] = 0;
              }
              for (const trans of relevantTransactions) {
                paymentsByTenant[trans.partyName] = (paymentsByTenant[trans.partyName] || 0) + Number(trans.amount);
              }

              const amountPaid = chargeData.amount - chargeData.balance;
              const potentialPayers = Object.entries(paymentsByTenant).filter(([, totalAmount]) => Math.abs(totalAmount - amountPaid) < 0.01);

              if (potentialPayers.length === 1) {
                const [payerName] = potentialPayers[0];
                const finalOccupancy = occupanciesMatchingRent.find(occ => occ.tenant?.name === payerName);
                if (finalOccupancy) {
                  matchedOccupancy = finalOccupancy;
                  logger.info(`[Scraper Task] Matched charge ${chargeData.id} to tenant '${payerName}' via transaction analysis.`);
                }
              } else if (potentialPayers.length > 1) {
                logger.warn(`[Scraper Task] [AMBIGUOUS] Found multiple tenants whose payments match the paid amount for charge ${chargeData.id}.`);
              }
            }
          }
        }
      }

      if (!matchedOccupancy && candidateOccupancies.length === 1) {
        matchedOccupancy = candidateOccupancies[0];
        logger.info(`[Scraper Task] Matched charge ${chargeData.id} to tenant '${matchedOccupancy.tenant.name}' via single-unit property fallback.`);
      }

      let tenantId = matchedOccupancy?.tenant?.id || null;

      if (!tenantId) {
        const chargeDate = safeCreateDate(chargeData.occurredOn);
        if (chargeDate) {
          const snapshot = await occupancySnapshotRepository.findOne({
            where: {
              snapshotDate: LessThanOrEqual(chargeDate),
            },
            order: {
              snapshotDate: 'DESC',
            },
          });

          if (snapshot) {
            tenantId = snapshot.tenantId;
            logger.info(`[Scraper Task] Matched charge ${chargeData.id} to tenant via snapshot fallback.`);
          }
        }
      }

      if (!tenantId) {
        logger.warn(
          `[Scraper Task] [WARN] Could not unambiguously associate a tenant for charge ID '${chargeData.id}' (Property: ${property.name}, Amount: ${chargeData.amount}). Tenant will be null.`,
        );
      }

      await tenantChargeRepository.upsert(
        {
          externalId: chargeData.id,
          amount: chargeData.amount,
          balance: chargeData.balance,
          occurredOn: safeCreateDate(chargeData.occurredOn),
          propertyId: property.id,
          tenantId: tenantId,
        },
        ['externalId'],
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
  const occupancySnapshotRepository = AppDataSource.getRepository(OccupancySnapshot);

  for (const propData of properties) {
    try {
      const propertyName = propData.attributes?.raw_display_name;
      const propertyAddress = propData.relationships?.address?.attributes?.full;

      if (!propertyName || !propertyAddress) {
        logger.warn(`[Scraper Task] [SKIP] Property with externalId '${propData.id}' is missing name or address.`);
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

      const units = propData.relationships?.units || [];
      for (const unitData of units) {
        if (!unitData.id || !unitData.attributes?.name) {
          logger.warn(`[Scraper Task] [SKIP] Unit for property '${propData.id}' is missing an ID or name.`);
          continue;
        }

        let unit = await unitRepository.findOne({
          where: { externalId: unitData.id },
          relations: ['currentOccupancy', 'currentOccupancy.tenant'],
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

        const occupancyData = unitData.relationships?.current_occupancy;
        const existingOccupancy = unit.currentOccupancy;

        if (existingOccupancy) {
          if (!occupancyData || existingOccupancy.externalId !== occupancyData.id) {
            await occupancyRepository.remove(existingOccupancy);
          }
        }

        if (occupancyData) {
          let occupancy = await occupancyRepository.findOne({ where: { externalId: occupancyData.id } });
          const leaseData = occupancyData.relationships?.lease;
          const leaseEndDate = safeCreateDate(leaseData?.attributes.end_on);
          let tenant: Tenant | null = null;

          const occupancyId = occupancyData.id;
          const matchingTransaction = await AppDataSource.getRepository(Transaction).findOne({
            where: {
              partyId: occupancyId,
              type: 'cashIn',
            },
            order: { postedOn: 'DESC' },
          });

          if (matchingTransaction?.partyName) {
            const tenantName = matchingTransaction.partyName;
            tenant = await tenantRepository.findOne({ where: { name: tenantName } });

            if (!tenant) {
              logger.warn(
                `[Scraper Task] [WARN] A transaction was found for occupancy ID ${occupancyId}, but the tenant '${tenantName}' does not exist in the database. Please run the 'populate-tenants' task.`,
              );
            }
          } else {
            logger.warn(`[Scraper Task] [WARN] No transaction found with partyId matching occupancy ID '${occupancyId}'. Cannot assign tenant.`);
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
            const rentChanged = Number(occupancy.rent) !== occupancyData.attributes.total_rent_and_subsidy;
            const existingLeaseEndDate = occupancy.leaseEnd ? new Date(occupancy.leaseEnd) : null;
            const leaseEndChanged = existingLeaseEndDate?.getTime() !== leaseEndDate?.getTime();

            if (rentChanged || leaseEndChanged) {
              const snapshot = occupancySnapshotRepository.create({
                occupancyId: occupancy.externalId,
                snapshotDate: new Date(),
                unitId: unit.id,
                tenantId: occupancy.tenant?.id,
                moveIn: occupancy.moveIn,
                rent: occupancy.rent,
                leaseEnd: occupancy.leaseEnd,
              });
              await occupancySnapshotRepository.save(snapshot);
            }

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
      hasMorePages = false;
    }
  }

  logger.info(`[Scraper Task] Fetched a total of ${allTransactions.length} transactions. Processing for bulk insert...`);
  await insertTransactions(allTransactions);
  logger.info(`[Scraper Task] --- Completed fetching for ${startDate} - ${endDate} ---`);
}

const formatDateForApi = (date: Date): string => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

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
  let endDate: Date;

  let logMessage: string;

  if (year) {
    logMessage = `[Scraper Task] Scraping for specified year: ${year}`;
    startDate = new Date(year, 0, 1);
    if (year === today.getFullYear()) {
      endDate = today;
    } else {
      endDate = new Date(year, 11, 31);
    }
  } else if (historic) {
    logMessage = `[Scraper Task] Scraping current year to date (historic).`;
    startDate = new Date(today.getFullYear(), 0, 1);
    endDate = today;
  } else {
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
    if (!sessionCookie) {
      logger.error(`[Scraper Task] Authentication failed. Aborting ${jobType} scraping process.`);
      return;
    }
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
    if (!sessionCookie) {
      logger.error('[Property Scraper Task] Authentication failed. Aborting property scraping process.');
      return;
    }
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
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startDate = options.startDate || formatDateForApi(startOfMonth);
  const endDate = options.endDate || formatDateForApi(today);

  logger.info(`[Tenant Charge Scraper Task] Starting tenant charge scrape for ${startDate} - ${endDate}...`);
  try {
    logger.info('[Tenant Charge Scraper Task] Authenticating with Appfolio...');
    const sessionCookie = await authenticateAndGetCookie();
    if (!sessionCookie) {
      logger.error('[Tenant Charge Scraper Task] Authentication failed. Aborting tenant charge scraping process.');
      return;
    }
    logger.info('[Scraper Task] Authentication successful.');
    const recordsPerPage = 25;
    let offset = 0;
    let hasMorePages = true;
    while (hasMorePages) {
      try {
        const tenantChargesPage = await fetchTenantChargesPage(sessionCookie, startDate, endDate, recordsPerPage, offset);
        if (tenantChargesPage.length > 0) {
          logger.info(`[Tenant Charge Scraper Task] Fetched ${tenantChargesPage.length} records (offset: ${offset}). Inserting into DB...`);
          await insertTenantCharges(tenantChargesPage);
          offset += tenantChargesPage.length;
        }
        if (tenantChargesPage.length < recordsPerPage) {
          hasMorePages = false;
        }
      } catch (error: any) {
        logger.error(`[Tenant Charge Scraper Task] Error fetching page at offset ${offset}. Stopping pagination:`, error.message);
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
