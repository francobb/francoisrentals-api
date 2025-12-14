# Data Models

This document describes the data models used in the Francois Rentals API. The application uses TypeORM with a PostgreSQL database.

## Core Data Models

### Property
Represents a physical property with multiple units.
-   `id`: A unique identifier for the property.
-   `externalId`: The external ID from the scraped source (e.g., AppFolio).
-   `name`: The name of the property (e.g., "23 Paradis Avenue").
-   `address`: The full address of the property.
-   `managementFee`, `mortgage`, `sewer`, `water`, `trash`, `gas`: Expense fields (Note: Currently unused/inactive feature).
-   Relations: `transactions`, `units`, `tenants`.

**File:** `src/models/property.pg_model.ts`

### Unit
Represents an individual unit within a `Property`.
-   `id`: A unique identifier for the unit.
-   `externalId`: The external ID from the scraped source.
-   `name`: The name/number of the unit (e.g., "Unit 1").
-   `occupied`: A boolean indicating if the unit is currently occupied.
-   Relations: `property`, `currentOccupancy`.

**File:** `src/models/unit.pg_model.ts`

### Tenant
Represents a tenant, who can have multiple occupancies over time.
-   `id`: A unique identifier for the tenant.
-   `externalId`: The external ID from the scraped source.
-   `name`: The name of the tenant.
-   `email`: The tenant's email address.
-   `phone`: The tenant's phone number.
-   `customerId`: The tenant's ID in the Stripe payment system.
-   Relations: `property`, `transactions`, `occupancies`.

**File:** `src/models/tenant.pg_model.ts`

### Occupancy
Represents the period of time a `Tenant` occupies a `Unit`. This tracks the history of a unit's occupancy.
-   `id`: A unique identifier for the occupancy.
-   `externalId`: The external ID from the scraped source.
-   `moveIn`: The date the tenant moved in.
-   `rent`: The monthly rent amount during this occupancy.
-   `leaseEnd`: The date the lease ends.
-   Relations: `unit`, `tenant`.

**File:** `src/models/occupancy.pg_model.ts`

### Transaction
Represents a single financial transaction, linked to a `Property` and often a `Tenant`.
-   `id`: A unique identifier for the transaction.
-   `externalId`: The external ID from the scraped source.
-   `postedOn`: The date the transaction was posted.
-   `amount`: The amount of the transaction.
-   `description`: The description of the transaction (e.g., "Rent for September").
-   `type`: The type of the transaction (`cashIn` or `cashOut`).
-   `partyId`: The external ID of the party (tenant) associated with the transaction.
-   `partyName`: The name of the party (tenant) associated with the transaction. This is the source of truth for a tenant's name.
-   Relations: `property`.

**File:** `src/models/transactions.pg_model.ts`

### TenantCharge
Represents a specific charge (like rent or a late fee) applied to a tenant's account.
-   `id`: A unique identifier for the charge.
-   `externalId`: The external ID from the scraped source.
-   `amount`: The amount of the charge.
-   `balance`: The outstanding balance of the charge.
-   `occurredOn`: The date the charge was applied.
-   Relations: `property`, `tenant`.

**File:** `src/models/tenant-charge.pg_model.ts`

## Snapshot Models (for Historical Data)

To preserve history, snapshots of records are taken before they are updated or deleted.

### OccupancySnapshot
A snapshot of an `Occupancy` record at a specific point in time.
-   `occupancyId`: The ID of the original occupancy.
-   `snapshotDate`: The date the snapshot was taken.
-   ... (contains all the fields from the `Occupancy` model).

**File:** `src/models/occupancy-snapshot.pg_model.ts`

### TenantChargeSnapshot
A snapshot of a `TenantCharge` record at a specific point in time.
-   `chargeId`: The ID of the original charge.
-   `snapshotDate`: The date the snapshot was taken.
-   ... (contains all the fields from the `TenantCharge` model).

**File:** `src/models/tenant-charge-snapshot.pg_model.ts`
