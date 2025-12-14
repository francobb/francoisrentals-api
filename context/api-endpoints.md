# API Endpoints

This document describes the API endpoints for the Francois Rentals API.

## Authentication

Authentication is handled via a stateless model. The client is responsible for authenticating with an external provider (e.g., Google) and acquiring an ID Token. This token must be sent with every request to a protected endpoint in the `Authorization` header.

**Header Format:**
`Authorization: Bearer <GOOGLE_ID_TOKEN>`

The `statelessAuth` middleware on the server validates this token with Google and checks if the user's email matches the `ADMIN_EMAIL` specified in the environment variables.

---

## Core Endpoints

### Assistant

-   `POST /assistant/question`: Ask a question to the AI analyst.
    -   **Authentication:** Requires a valid Google ID Token from the admin user.
    -   **Body:** `{ "question": "Your question here" }`

**File:** `src/routes/assistant.route.ts`

### Properties

-   `GET /properties`: Get all properties.
    -   **Authentication:** Requires a valid Google ID Token from the admin user.

**File:** `src/routes/properties.route.ts`

### Tenants

-   `GET /tenants`: Get all tenants.
    -   **Authentication:** Requires a valid Google ID Token from the admin user.
-   `GET /tenants/getById`: Get a tenant by ID.
    -   **Authentication:** Requires a valid Google ID Token from the admin user.
-   ... (other tenant routes)

**File:** `src/routes/tenants.route.ts`

### Transactions

-   `GET /transactions`: Get all transactions.
    -   **Authentication:** Requires a valid Google ID Token from the admin user.
-   ... (other transaction and scraper routes)

**File:** `src/routes/transactions.route.ts`
