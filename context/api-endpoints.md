# API Endpoints

This document describes the API endpoints for the Francois Rentals API.

## AI

-   `POST /ai/question`: Ask a question to the AI.

**File:** `src/routes/ai.route.ts`

## Assistant

-   `POST /assistant/question`: Ask a question to the assistant.
    -   Requires API key.

**File:** `src/routes/assistant.route.ts`

## Authentication

-   `POST /signup`: Sign up a new user.
-   `POST /login`: Log in a user.
-   `POST /logout`: Log out a user.
-   `POST /forgot`: Send a password reset email.
-   `POST /signin`: Sign in a user using Passport.js.

**File:** `src/routes/auth.route.ts`

## Google

-   `GET /getAuthUrl`: Get the Google authentication URL.
-   `POST /auth/google/client`: Handle Google authentication for a client.
-   `GET /google`: Authenticate with Google using Passport.js.
-   `GET /auth/google/callback`: Handle the Google OAuth callback.

**File:** `src/routes/google.route.ts`

## Maintenance

-   `POST /maintenance`: Submit a maintenance request.
    -   Requires `ADMIN`, `OWNER`, or `TENANT` role.

**File:** `src/routes/maintenance.route.ts`

## Properties

-   `GET /properties`: Get all properties.
    -   Requires API key.
-   `GET /properties/expenses/average`: Get the average expenses for all properties.
    -   Requires API key.

**File:** `src/routes/properties.route.ts`

## Stripe

-   `GET /payment/transactions`: Get all Stripe transactions.
    -   Requires `ADMIN` or `TENANT` role.
-   `POST /payment`: Receive a rent payment.
    -   Requires `ADMIN` or `TENANT` role.
-   `POST /payment/request`: Receive a payment request.
    -   Requires `ADMIN` or `TENANT` role.
-   `POST /payment/webhook`: Process a Stripe webhook.

**File:** `src/routes/stripe.route.ts`

## Tenants

-   `GET /tenants`: Get all tenants.
    -   Requires `ADMIN` role.
-   `GET /tenants/getById`: Get a tenant by ID.
    -   Requires `ADMIN` or `TENANT` role.
-   `GET /tenants/:property`: Get tenants by property.
    -   Requires `ADMIN` or `TENANT` role.
-   `POST /tenants`: Create a new tenant.
    -   Requires `ADMIN` role.
-   `PUT /tenants`: Update a tenant.
    -   Requires `ADMIN` role.

**File:** `src/routes/tenants.route.ts`

## Tenant Charges

-   `GET /tenant-charges`: Get all tenant charges.
    -   Requires API key.

**File:** `src/routes/tenant-charges.route.ts`

## Transactions

-   `GET /transactions`: Get all transactions.
    -   Requires API key.
-   `GET /transactions/tenant-charges`: Get all tenant charges.
    -   Requires API key.
-   `GET /transactions/rent-snapshot`: Get a monthly rent snapshot.
    -   Requires API key.
-   `GET /transactions/run-scraper`: Run the transaction scraper.
-   `GET /transactions/scraper/properties`: Run the property scraper.
-   `GET /transactions/scraper/tenant-charges`: Run the tenant charge scraper.
-   `GET /transactions/populate-tenants`: Populate the tenants table.
-   `GET /transactions/link-occupancies`: Link occupancies to tenants.
    -   Requires API key.

**File:** `src/routes/transactions.route.ts`

## Twilio

-   `GET /twilio/rent`: Send a rent reminder.

**File:** `src/routes/twilio.route.ts`
