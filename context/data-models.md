# Data Models

This document describes the data models used in the Francois Rentals API.

## Mongoose Models (OLD UNUSED)

These models use Mongoose for MongoDB.

### User

-   `email`: User's email (unique).
-   `name`: User's name.
-   `password`: User's hashed password.
-   `role`: User's role (`OWNER`, `ADMIN`, `TENANT`).
-   `resetTokenExpires`: Expiration date for password reset token.
-   `resetToken`: Password reset token.

**File:** `src/models/users.model.ts`

### Google

-   `refresh_token`: Google API refresh token (unique).
-   `access_token`: Google API access token.
-   `token_type`: Token type.
-   `expiry_date`: Token expiration date.

**File:** `src/models/google.model.ts`

### Tenant (Mongoose)

-   `email`: Tenant's email (unique).
-   `lease_to`: Lease end date.
-   `move_in`: Move-in date.
-   `name`: Tenant's name.
-   `phone`: Tenant's phone numbers.
-   `property`: Property name (`23 Paradis Ave`, `212 Welles St`).
-   `unit`: Unit number (`0`, `1`, `2`, `3`).
-   `customerId`: Customer ID.
-   `rentalAmount`: Monthly rental amount.
-   `rentalBalance`: Current rental balance.
-   `isMonthly`: Whether the tenant is on a monthly lease.

**File:** `src/models/tenants.model.ts`

### Maintenance Request

-   `details`: Details of the maintenance request.
-   `location`: Location of the issue.
-   `room`: Room where the issue is located.
-   `unit`: Unit number.
-   `date`: Date of the request.
-   `imagePaths`: Paths to images of the issue.

**File:** `src/models/requests.model.ts`

### Transaction (Mongoose)

-   `balance`: Transaction balance.
-   `date`: Transaction date.
-   `desc`: Transaction description.
-   `location`: Transaction location.
-   `outcome`: Transaction outcome.
-   `payeePayer`: Payee or payer.

**File:** `src/models/transactions.model.ts`

## TypeORM Models

These models use TypeORM for PostgreSQL.

### Occupancy

-   `id`: A unique identifier for the occupancy.
-   `externalId`: The external ID of the occupancy.
-   `moveIn`: The date the tenant moved in.
-   `rent`: The monthly rent amount.
-   `leaseEnd`: The date the lease ends.
-   `unit`: The unit associated with the occupancy.
-   `tenant`: The tenant associated with the occupancy.
-   `tenantId`: The ID of the tenant associated with the occupancy.

**File:** `src/models/occupancy.pg_model.ts`

### Occupancy Snapshot

-   `occupancyId`: The external ID of the occupancy.
-   `snapshotDate`: The date the snapshot was taken.
-   `unit`: The unit associated with the occupancy.
-   `unitId`: The ID of the unit associated with the occupancy.
-   `tenant`: The tenant associated with the occupancy.
-   `tenantId`: The ID of the tenant associated with the occupancy.
-   `moveIn`: The date the tenant moved in.
-   `rent`: The monthly rent amount.
-   `leaseEnd`: The date the lease ends.

**File:** `src/models/occupancy-snapshot.pg_model.ts`

### Unit

-   `id`: A unique identifier for the unit.
-   `externalId`: The external ID of the unit.
-   `name`: The name of the unit.
-   `occupied`: Whether the unit is occupied.
-   `property`: The property the unit belongs to.
-   `propertyId`: The ID of the property the unit belongs to.
-   `currentOccupancy`: The current occupancy of the unit.

**File:** `src/models/unit.pg_model.ts`

### Tenant (TypeORM)

-   `id`: A unique identifier for the tenant.
-   `externalId`: The external ID of the tenant.
-   `name`: The name of the tenant.
-   `property`: The property the tenant belongs to.
-   `propertyId`: The ID of the property the tenant belongs to.
-   `transactions`: The transactions associated with the tenant.
-   `occupancies`: The occupancies associated with the tenant.

**File:** `src/models/tenant.pg_model.ts`

### Property

-   `id`: A unique identifier for the property.
-   `externalId`: The external ID of the property.
-   `name`: The name of the property.
-   `address`: The address of the property.
-   `managementFee`: The management fee for the property.
-   `mortgage`: The mortgage for the property.
-   `sewer`: The sewer cost for the property.
-   `water`: The water cost for the property.
-   `trash`: The trash cost for the property.
-   `gas`: The gas cost for the property.
-   `transactions`: The transactions associated with the property.
-   `units`: The units associated with the property.
-   `tenants`: The tenants associated with the property.

**File:** `src/models/property.pg_model.ts`

### Transaction (TypeORM)

-   `id`: A unique identifier for the transaction.
-   `externalId`: The external ID of the transaction.
-   `postedOn`: The date the transaction was posted.
-   `amount`: The amount of the transaction.
-   `description`: The description of the transaction.
-   `type`: The type of the transaction (`cashIn` or `cashOut`).
-   `partyId`: The ID of the party associated with the transaction.
-
-   `partyName`: The name of the party associated with the transaction.
-   `property`: The property associated with the transaction.
-   `propertyId`: The ID of the property associated with the transaction.
-   `createdAt`: The date the transaction was created.

**File:** `src/models/transactions.pg_model.ts`

### Tenant Charge

-   `id`: A unique identifier for the tenant charge.
-   `externalId`: The external ID of the tenant charge.
-   `amount`: The amount of the charge.
-   `balance`: The balance of the charge.
-   `occurredOn`: The date the charge occurred.
-   `property`: The property associated with the charge.
-   `propertyId`: The ID of the property associated with the charge.
-   `tenant`: The tenant associated with the charge.
-   `tenantId`: The ID of the tenant associated with the charge.
-   `createdAt`: The date the charge was created.

**File:** `src/models/tenant-charge.pg_model.ts`

### Tenant Charge Snapshot

-   `chargeId`: The external ID of the charge.
-   `snapshotDate`: The date the snapshot was taken.
-   `amount`: The amount of the charge.
-   `balance`: The balance of the charge.
-   `occurredOn`: The date the charge occurred.
-   `property`: The property associated with the charge.
-   `propertyId`: The ID of the property associated with the charge.
-   `tenant`: The tenant associated with the charge.
-   `tenantId`: The ID of the tenant associated with the charge.

**File:** `src/models/tenant-charge-snapshot.pg_model.ts`
