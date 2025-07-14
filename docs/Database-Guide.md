# Database Guide

This document provides a guide to understanding, managing, and interacting with the database for the "Adopte1Etudiant" application.

---

## 1. Overview

*   **Database System**: **[PostgreSQL](https://www.postgresql.org/)**, a powerful and reliable open-source relational database.
*   **ORM**: **[Prisma](https://www.prisma.io/)**, a next-generation ORM that provides a type-safe database client, a declarative schema, and a built-in migration system.

All database-related files, including the schema, migrations, and seed script, are located in the `apps/api/prisma/` directory.

---

## 2. Prisma Schema

The **single source of truth** for the database structure is the Prisma schema file, located at:
`apps/api/prisma/schema.prisma`

This file defines all database models (tables), their columns (fields), types, and relations.

### Key Models

*   `User`: The central model for any entity that can log in. Contains authentication details and a `role` (`STUDENT` or `COMPANY`).
*   `StudentProfile` & `CompanyProfile`: One-to-one relations with `User`. These models hold the specific profile information for each user type.
*   `Skill`: A model to store skills that can be associated with students and required by offers.
*   `Offer`: Represents a job/internship offer posted by a `COMPANY`.
*   `Application`: A many-to-many join table representing a `STUDENT`'s application to an `Offer`.
*   `AdoptionRequest`: Represents a `COMPANY`'s request to connect with a `STUDENT`.
*   `Conversation` & `Message`: Models for the in-app messaging feature.
*   `OAuthAccount`: Stores information for users who sign up via third-party providers like Google.

---

## 3. Database Migrations

Prisma Migrate is used to manage incremental, reversible changes to the database schema. Migrations are generated automatically by Prisma based on changes you make to the `schema.prisma` file.

### How to Create a Migration

1.  Modify the `apps/api/prisma/schema.prisma` file (e.g., add a new field to a model).
2.  Run the following command from the root of the monorepo:

    ```bash
    cd apps/api
    npx prisma migrate dev --name your_migration_name
    ```

    *   `prisma migrate dev`: This command compares the current state of the schema file with the last migration, generates a new SQL migration file, and applies it to your development database.
    *   `--name`: Provides a descriptive name for the migration folder.

3.  A new directory will be created under `apps/api/prisma/migrations/` containing the SQL migration file.
4.  **Commit the generated migration files** to version control so that other developers and the CI/CD pipeline can run them.

---

## 4. Database Seeding

The project includes a seed script to populate the database with realistic data for development and testing.

*   **Script Location**: `apps/api/prisma/seed.ts`
*   **Tooling**: Uses **`@faker-js/faker`** to generate a rich dataset of users, companies, offers, applications, and conversations.

### How to Seed the Database

The seed script is automatically executed whenever you run `prisma migrate dev`.

If you need to re-run the seed script manually on an existing database, use this command:

```bash
npm run db:seed --workspace=apps/api
```

---

## 5. Using Prisma Client

Prisma Client is a type-safe query builder that is auto-generated from your Prisma schema. It is the primary way the application interacts with the database.

It is instantiated once and made available through the application's context.

### Example Usage (in a controller)

```typescript
// Example from a controller in apps/api/src/controllers/

import prisma from '../path/to/prisma/client'; // Simplified import

// Fetching all offers with their related company and skills
export const getAllOffers = async (req, reply) => {
  const offers = await prisma.offer.findMany({
    include: {
      company: {
        include: {
          profile: true,
        },
      },
      skills: true,
    },
  });
  reply.send(offers);
};
```

Because Prisma Client is fully typed, you get autocompletion and compile-time checks for all your database queries, significantly reducing runtime errors.

---

## 6. Fast Prototyping (Non-Migration Workflow)

For rapid prototyping during early development, you may not want to create a migration for every small schema change. In such cases, you can use `db push` to sync your schema with the database directly.

**WARNING**: This command is for **development only**. It does not create migration files and can lead to data loss. Do not use it in production or for collaborative development where migrations are necessary.

```bash
npm run db:push --workspace=apps/api
```

If you have existing data and need to force the changes, you can add `--force --accept-data-loss`, but be aware of the consequences. For this project, we have a convenience script:

```bash
# In package.json for the api app
"db:force": "prisma db push --force --accept-data-loss"
```
