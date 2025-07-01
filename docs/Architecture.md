# Architecture

This document outlines the software architecture of the "AdopteUnEtudiant" application.

## Overview

The application is built using a **monorepo architecture**, managed with pnpm workspaces and orchestrated by Turborepo. This structure allows for shared code and configurations, improving maintainability and development speed. The project is divided into two main applications (`apps`) and several shared packages (`packages`).

The architecture follows a classic **client-server model**:

*   **`apps/web`**: A modern frontend application built with React, Vite, and TypeScript. It is a Single-Page Application (SPA) responsible for the user interface and user experience.
*   **`apps/api`**: A backend server built with Node.js, Fastify, and TypeScript. It provides a RESTful API for the frontend to consume, handling business logic, database interactions, and authentication.
*   **Database**: A PostgreSQL database is used for data persistence, with Prisma serving as the Object-Relational Mapper (ORM) for type-safe database access.

![High-Level Architecture](https://i.imgur.com/example.png)  <-- *Note: Replace with a real diagram link if available.*

---

## Detailed Components

### 1. Frontend (`apps/web`)

*   **Framework**: [React](https://reactjs.org/) (with hooks and functional components).
*   **Build Tool**: [Vite](https://vitejs.dev/) for fast development and optimized builds.
*   **Language**: [TypeScript](https://www.typescriptlang.org/).
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a utility-first CSS workflow.
*   **State Management**: React Context API (`AuthContext`) is used for managing global state like user authentication.
*   **Routing**: `react-router-dom` is used for client-side routing.
*   **Key Responsibilities**:
    *   Rendering all UI components.
    *   Handling user input and interactions.
    *   Communicating with the backend API via `fetch` or `axios` in service modules (`src/services`).
    *   Managing client-side state.

### 2. Backend (`apps/api`)

*   **Framework**: [Fastify](https://www.fastify.io/), a high-performance, low-overhead web framework for Node.js.
*   **Language**: [TypeScript](https://www.typescriptlang.org/).
*   **Database ORM**: [Prisma](https://www.prisma.io/) for interacting with the PostgreSQL database. Prisma provides type safety and auto-generated queries.
*   **Authentication**: Implemented using JSON Web Tokens (JWT). The backend handles user registration, login (password-based and OAuth with Google), and session management via tokens.
*   **Architecture Style**: RESTful API. The API is structured with controllers, services (implicitly), and routes for modularity.
    *   `src/routes`: Define API endpoints.
    *   `src/controllers`: Contain the business logic for each route.
    *   `src/middleware`: Handle cross-cutting concerns like authentication (`authMiddleware`) and authorization (`roleMiddleware`).
*   **Key Responsibilities**:
    *   Exposing secure endpoints for data manipulation.
    *   Validating incoming data.
    *   Authenticating and authorizing users.
    *   Executing business logic (e.g., calculating match scores, managing applications).
    *   Interacting with the database via Prisma.

### 3. Shared Packages (`packages/`)

*   **`shared-types`**: A crucial package for sharing TypeScript type definitions (e.g., `User`, `Offer`, `Application`) between the frontend and backend. This ensures type consistency across the stack.
*   **`core`**: Contains shared business logic that can be used by any part of the monorepo. The `MatchScoreService` is a key example.
*   **`tsconfig`**: Provides base `tsconfig.json` configurations to ensure consistent TypeScript settings across all packages and apps.

### 4. Database

*   **Engine**: [PostgreSQL](https://www.postgresql.org/).
*   **Schema Management**: Prisma Migrate is used to manage database schema changes through declarative migration files located in `apps/api/prisma/migrations`.
*   **Seeding**: The database is seeded with realistic fake data using `@faker-js/faker` to facilitate development and testing. The seed script is in `apps/api/prisma/seed.ts`.

### 5. Development & Deployment

*   **Containerization**: [Docker](https://www.docker.com/) and `docker-compose.yml` are provided for setting up a consistent local development environment, including the database and application services.
*   **CI/CD**: The project is configured for Continuous Integration and Continuous Deployment (see `CI-CD.md`). The workflow includes steps for building, testing, and deploying the applications.

---

## Design Patterns and Principles

*   **Stateless Server**: The backend API is stateless. All state required to process a request is contained within the request itself (e.g., JWT in the `Authorization` header). This simplifies scalability.
*   **Role-Based Access Control (RBAC)**: Authorization is managed through roles (`STUDENT`, `COMPANY`). Middleware checks the user's role before granting access to certain endpoints.
*   **Service Layer Pattern**: API logic is separated into services (e.g., `authService`, `offerService` on the frontend; controllers act as services on the backend) to encapsulate business logic and data access.
*   **Monorepo**: Centralizes code management, simplifies dependency management, and promotes code sharing.
