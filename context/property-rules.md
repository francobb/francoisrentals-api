# Property Rules

This document outlines the rules and characteristics of the properties managed by the Francois Rentals API.

## Application Purpose

The primary purpose of this application is to serve as a centralized hub for **analytics, reporting, and clean data storage** related to the property portfolio. It achieves this by:

1.  **Ingesting** raw data from a third-party management platform (AppFolio) via scraping.
2.  **Cleaning and Cross-Referencing** the data to create a unified, reliable dataset.
3.  **Storing** the data in a structured format for historical analysis and reporting.
4.  **Exposing** the cleaned data through a consistent API for use in reports and other analytical tools.

## Property Type

The properties managed by this API are exclusively **Multifamily residential properties**. There are no commercial, short-term rental, or HOA properties.

## Management

The properties are managed by a third-party company. This company uses **AppFolio** to manage the properties and provide transaction data.

## Data Sourcing & Cross-Referencing

The data for the Francois Rentals API is sourced by **scraping** multiple endpoints from AppFolio. The scraped data is then saved locally and must be cross-referenced to build a complete picture.

### Data Flow & Linkage

1.  **Scraping**: Separate scraping tasks are run to fetch different data types:
    *   `runPropertyScraperTask`: Fetches properties, units, and occupancy information.
    *   `runScraperTask`: Fetches financial transactions.
    *   `runTenantChargeScraperTask`: Fetches tenant-specific charges.

2.  **Cross-Referencing**: The scraped data is incomplete on its own and must be linked:
    *   **Tenants and Occupancies**: The property scraper gets occupancy information, but this data does not contain the tenant's name. The system identifies the tenant by finding a **transaction** where the `partyId` matches the `occupancyId`. The `partyName` on that transaction is the tenant's name, which is then used to link the `Tenant` record to the `Occupancy` record.
    *   **Tenant Charges**: Tenant charges often lack a direct link to a specific tenant. The system uses a series of heuristics to associate a charge with a tenant, such as matching the charge amount to a tenant's unique rent, analyzing historical charges, or correlating recent payments from tenants with the charge amount.

3.  **API Usage**: The API then uses this combined and cross-referenced local data to provide information about the properties, tenants, and transactions.

### Key Data Points & Their Sources

-   **Properties, Units, Occupancy**: Scraped from the `/api/owner_properties` endpoint. This provides the structure of the properties but lacks direct tenant identifiers.
-   **Transactions**: Scraped from the `/api/owner_transactions` endpoint. This is the **only source for tenant names** (`partyName`) and provides the crucial `partyId` used for linking.
-   **Tenant Charges**: Scraped from the `/api/tenant_charges` endpoint. This data requires complex logic to be correctly associated with the right tenant.

### Leasing and Occupancy Lifecycle

-   **Move-Outs & Vacancies**: When a tenant moves out, the `Occupancy` record for that unit is updated to reflect the vacancy. Before this happens, a snapshot of the previous occupancy record is created in the `occupancy_snapshots` table to preserve the historical data.
-   **Lease Renewals & Month-to-Month**: When a lease is renewed or transitions to a month-to-month agreement, the existing `Occupancy` record is updated with the new lease terms (e.g., a new `leaseEnd` date).
-   **Security Deposits**: Security deposits are not currently tracked as a distinct transaction type.

### Financial Details

-   **Prorated Rent**: Prorated rent charges are identified by the presence of "(Prorated)" in the transaction description (e.g., "Rent Income - February 2024 (Prorated)").
-   **Late Fees**: Late fees are identified by their description in the transaction data.
-   **Property-Level Expenses**: The fields for property-level expenses (e.g., `mortgage`, `sewer`, `water`) in the `Property` model are not currently in use and are not populated with data.
-   **NSF Reversals**: When a rent payment is reversed by the bank due to non-sufficient funds (NSF), AppFolio creates a new transaction that counteracts the original payment. This is typically a "cashOut" transaction with a description indicating it is an NSF reversal. The system scrapes this new transaction, and the tenant's balance will be adjusted accordingly.
