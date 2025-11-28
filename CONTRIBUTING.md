# Contributing to Francois Rentals API

This document provides a guide for contributing to the Francois Rentals API.

## Project Structure

The project is a Node.js application written in TypeScript. Here is a breakdown of the key directories:

-   `src/`: Contains the main source code for the application.
    -   `models/`: Database models.
    -   `routes/`: API route definitions.
    -   `tasks/`: Background tasks, such as data scraping.
    -   `utils/`: Utility functions.
-   `context/`: Contains context files for the Gemini AI agent.
-   `scripts/`: Contains scripts for various tasks.
-   `tests/`: Contains tests for the application.

## Development

To get started, install the dependencies and run the development server:

```bash
npm install
npm run dev
```

## Important Files

-   `src/models/occupancy.pg_model.ts`: Defines the `Occupancy` data model.
-   `src/models/occupancy-snapshot.pg_model.ts`: Defines the `OccupancySnapshot` data model.
-   `src/routes/tenants.route.ts`: Defines the API endpoints for managing tenants.
-   `src/tasks/scraper.task.ts`: Contains the logic for scraping occupancy data.
-   `src/tasks/find_occupancy.ts`: Contains the logic for finding occupancy data.
