# Development Guide

This guide provides all the necessary information for setting up the project locally, understanding its structure, and contributing to its development.

## 1. Prerequisites

- [Node.js](https://nodejs.org/) (v20.x or higher)
- [npm](https://www.npmjs.com/) (v9.x or higher)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

## 2. Installation & Setup

### a. Clone the Repository

Clone the repository and install dependencies using npm workspaces:

```bash
git clone https://github.com/your-username/adopte-un-etudiant.git
cd adopte-un-etudiant
npm install
```

### b. Environment Variables

This project requires environment variables for the database connection and Google OAuth2.

Create a `.env` file in the `apps/api` directory by copying the example file:

```bash
cp apps/api/.env.example apps/api/.env
```

**Database URL**: The default `DATABASE_URL` is pre-configured to work with the Docker setup.

**Google OAuth**: To enable Google login, you need to create OAuth 2.0 credentials in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials). Add the following variables to your `apps/api/.env` file:

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
```

> **Important**: For the Google OAuth callback to work locally, you must add `http://localhost:8080/api/auth/google/callback` to the "Authorized redirect URIs" in your Google Cloud credential settings.

### c. Database Setup

Start the PostgreSQL database service using Docker Compose:

```bash
docker compose up -d
```

Once the container is running, apply the Prisma schema to create the necessary tables and run the seed script:

```bash
npm run db:migrate:dev --workspace=apps/api
npm run db:seed --workspace=apps/api
```

## 3. Running the Application

Start the backend API and frontend web app in development mode:

```bash
npm run dev
```

The application will be available at the following URLs:
- **Frontend App**: `http://localhost:5173`
- **API Server**: `http://localhost:8080`

## 4. Monorepo Project Structure

This project uses a **Turborepo** monorepo structure to manage the backend, frontend, and shared packages.

```
├── apps/
│   ├── api/                 # Backend (Fastify)
│   └── web/                 # Frontend (React)
├── packages/
│   ├── core/                # Shared business logic
│   ├── shared-types/        # Shared types (Zod schemas)
│   └── tsconfig/            # Shared tsconfig
└── Dockerfile
```

## 5. Backend Development (API)

The backend is a **Fastify** server written in TypeScript.

### a. Folder Structure (`apps/api/src`)

- **`controllers/`**: Contains the orchestration logic for each route. A controller takes request data, calls business logic, and formats the response.
- **`middleware/`**: Contains reusable Fastify middleware (e.g., `authMiddleware.ts`, `roleMiddleware.ts`).
- **`routes/`**: Defines all API endpoints. Each file typically corresponds to a resource (e.g., `offer.ts`, `auth.ts`).
- **`index.ts`**: The main entry point. It initializes the Fastify server, registers plugins, and attaches all routes.

### b. Request Lifecycle

1.  **Server (`index.ts`)**: Fastify receives the request and applies global plugins (CORS, etc.).
2.  **Router (`routes/`)**: The router matches the URL and HTTP method to a specific route configuration.
3.  **Middleware (`middleware/`)**: The request passes through any attached middleware (e.g., `authMiddleware`). If a middleware rejects the request, the process stops.
4.  **Controller (`controllers/`)**: The request reaches the controller function, which executes the core logic.
5.  **ORM (Prisma)**: The controller interacts with the database via the Prisma client.
6.  **Response**: The controller returns a response, which Fastify sends back to the client.

## 6. Frontend Development (Web)

The frontend is a **React** application built with Vite and written in TypeScript.

### a. Folder Structure (`apps/web/src`)

- **`components/`**: Contains reusable React components, often organized by feature domain (e.g., `auth/`, `company/`).
- **`context/`**: Holds React Context providers for global state management (e.g., `AuthContext.tsx`).
- **`hooks/`**: Contains custom React hooks for encapsulating reusable logic (e.g., `useDebounce.ts`).
- **`pages/`**: High-level components that represent a full page or view, assembling smaller components.
- **`services/`**: Contains the logic for communicating with the backend API. This acts as a facade, so components don't make `fetch` calls directly.

### b. State Management

- **Local State**: Use the `useState` hook for state that is local to a single component.
- **Global State**: Use the **React Context API** for state shared across the application (e.g., authenticated user info). `AuthContext` is the primary example.

### c. Routing

Routing is managed by **`react-router-dom`**. Routes are defined in `App.tsx`, and the `ProtectedRoute.tsx` component is used to guard routes that require authentication.

## 7. Database Management

Database interactions are handled by **Prisma ORM**.

- **Schema**: The source of truth for your database structure is `apps/api/prisma/schema.prisma`.
- **Migrations**: To apply schema changes, run a migration:
  ```bash
  npm run db:migrate:dev --workspace=apps/api --name <migration-name>
  ```
- **Seeding**: To populate the database with test data, use the seed script:
  ```bash
  npm run db:seed --workspace=apps/api
  ```
- **Prisma Studio**: To view and edit data in your database, use Prisma Studio:
  ```bash
  npm run db:studio --workspace=apps/api
  ```

## 8. Available Scripts

- `npm run dev`: Start all apps in development mode.
- `npm run build`: Build all apps and packages for production.
- `npm run lint`: Lint all packages.
 - `npm run db:migrate:dev --workspace=apps/api`: Create and apply a new database migration.
 - `npm run db:push --workspace=apps/api`: (For development) Push schema changes directly to the DB without a migration file.
 - `npm run db:seed --workspace=apps/api`: Run the database seed script.
 - `npm run db:studio --workspace=apps/api`: Open Prisma Studio.