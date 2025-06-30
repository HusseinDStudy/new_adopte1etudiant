# Database Guide

This document covers everything related to the PostgreSQL database and the application's interaction with it via the **Prisma ORM**.

## 1. Prisma Schema

The file `apps/api/prisma/schema.prisma` is the **single source of truth** for your database structure.

-   **Model Definitions**: This is where you define your database tables (as `model`), their columns (`field`), data types, and relationships (e.g., `@relation(...)`).
-   **Client Generation**: Whenever you modify the schema and run a Prisma command (like `migrate` or `generate`), Prisma updates its type-safe client (`@prisma/client`). This provides excellent autocompletion and type safety when writing database queries in your application code.

## 2. Key Models Overview

Here is a brief overview of the core models in the `schema.prisma` file:

-   `User`: The central model representing both **Students** and **Companies**. A `role` field distinguishes between them. It holds authentication info and profile data.
-   `StudentProfile` / `CompanyProfile`: These models hold information specific to each role, linked one-to-one with the `User` model.
-   `Skill`: A simple model to store skills (e.g., "React", "Node.js").
-   `StudentSkill`: A join table to create a many-to-many relationship between `StudentProfile` and `Skill`.
-   `Offer`: Represents a job offer created by a `Company`. It has relationships with `Skill`s.
-   `Application`: A record of a `Student` applying to an `Offer`. It includes a `status` field (e.g., PENDING, ACCEPTED).
-   `Message`: A message sent within the context of an `Application`, linking a sender (`User`) to an `Application`.
-   `AdoptionRequest`: A request sent by a `Company` to a `Student`.

## 3. Migrations

Prisma manages the evolution of your database schema via a migration system. You should **never** modify the database schema manually.

### How to Create a New Migration

When you change the `schema.prisma` file (e.g., by adding a new field), you must create a migration to apply this change to the database.

1.  **Ensure your Docker database container is running.**
    ```bash
    docker-compose up -d
    ```
2.  **Run the `migrate dev` command.**
    This command will:
    -   Compare `schema.prisma` with the current state of the database.
    -   Generate a new SQL migration file in the `apps/api/prisma/migrations/` directory.
    -   Prompt you to name the migration (e.g., `add-user-phone-number`).
    -   Apply the generated migration to your development database.

    ```bash
    npm run db:migrate:dev --workspace=api
    ```

### Applying Migrations in Production

In a production environment, you should use the `migrate deploy` command. This non-interactively applies all pending migration files.

```bash
# This command is typically run as part of a deployment pipeline
npm run db:migrate:prod --workspace=api
```
*Note: The `db:migrate:prod` script in `package.json` executes `prisma migrate deploy`.*

## 4. Seeding the Database

To facilitate development and testing, a seeding script is available to populate your database with test data (e.g., fake users, offers, applications).

-   **The Script**: `apps/api/prisma/seed.ts`
-   **How to Run**: The script is designed to be run after migrations. You can also run it manually.

    ```bash
    npm run db:seed --workspace=api
    ```
If you need to add or modify the test data, this is the file to edit.

## 5. Prisma Studio

Prisma provides a modern, visual admin tool for your database. It is extremely useful for viewing, browsing, and editing data during development.

-   **How to Launch**:
    ```bash
    npm run db:studio --workspace=api
    ```
-   This will open a web interface in your browser (usually at `http://localhost:5555`) where you can see all your tables and their data.
