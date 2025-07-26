# Adopte1Etudiant - Campus Job Matching Platform

This project is a modern web platform designed to bridge the gap between students seeking valuable work experience and companies looking for emerging talent in France.

## 📚 Project Documentation

This project is fully documented. All documentation is organized in the `/docs` directory and serves as the project's official wiki.

- **[📖 Documentation Home](docs/Home.md)**: Complete documentation map and navigation
- **[👥 User Guides](docs/user-guides/)**: End-user documentation and manuals
- **[💻 Developer Guides](docs/developer-guides/)**: API documentation, development setup, and contribution guidelines
- **[🏗️ Technical Guides](docs/technical-guides/)**: Architecture, database, security, and implementation details
- **[📋 Project Management](docs/project-management/)**: CI/CD, testing strategies, and process documentation

## 🚀 Getting Started: Local Development

This is the recommended way to run the project locally. You will run the database in a Docker container and the application services directly on your host machine.

### Prerequisites

- Node.js (v20 or later)
- Docker and Docker Compose

### Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Initialize Environment Variables**
    This command copies the example `.env` files for you.
    ```bash
    npm run setup
    ```

3.  **Configure Your Environment**
    Manually edit the following files and fill in the required values (database credentials, OAuth keys, etc.):
    - `.env`
    - `apps/api/.env`
    - `apps/web/.env`

### Launching the Application

1.  **Start the database:**
    ```bash
    docker compose -f docker-compose.db.yml up -d
    ```

2.  **Run the applications:**
    This command will start both the API and Web services concurrently.
    ```bash
    npm run dev
    ```
    
    Alternatively, to see logs for each service in a separate terminal:
    ```bash
    # In terminal 1
    npm run dev --workspace=apps/api

    # In terminal 2
    npm run dev --workspace=apps/web
    ```

- **Access the application:**
  - **Web App**: `http://localhost:5173`
  - **API**: `http://localhost:8080`
  - **API Documentation**: `http://localhost:8080/docs` (Interactive Swagger UI)

## Project Commands

Here are the most common commands you'll use:

| Command                 | Description                                                                 |
| ----------------------- | --------------------------------------------------------------------------- |
| `npm install`           | Installs all dependencies for the monorepo.                                 |
| `npm run setup`         | Initializes `.env` files from examples. Run this once.                      |
| `npm run dev`           | Starts both API and Web apps in development mode.                           |
| `npm run build`         | Builds both API and Web apps for production.                                |
| `npm test`              | Runs all tests across the project.                                          |
| `npm run lint`          | Lints all code in the project.                                              |
| `npm run format`        | Formats all code with Prettier.                                             |
| `npm run db:migrate:dev`| Runs Prisma database migrations.                                            |
| `npm run db:seed`       | Seeds the database with initial data.                                       |
| `npm run db:studio`     | Opens Prisma Studio to view and manage your database.                       |
| `npm run docs:serve`    | Shows the URL for interactive API documentation (Swagger UI).               |
| `npm run docs:generate` | Generates OpenAPI specification files (JSON and YAML).                      |

## 🛠️ Other Ways to Run the Project

### Production Environment

The production environment runs using pre-built Docker images.

1.  **Build Production Images:**
    The production `Dockerfile` is multi-stage and can build targeted images.
    ```bash
    # Build the API image
    docker build -t your-registry/api:latest --target api .

    # Build the Web image
    docker build -t your-registry/web:latest --target web .
    ```

2.  **Push Images to a Registry (Optional, but recommended):**
    ```bash
    docker push your-registry/api:latest
    docker push your-registry/web:latest
    ```

3.  **Launch from Production Compose File:**
    Make sure you have a `.env` file configured for your production environment.
    ```bash
    docker compose -f docker-compose.prod.yml up -d
    ```

### Testing

- **Run all tests (Unit, Integration, etc.):**
  ```bash
  npm test
  ```
- **E2E and Stress Tests:**
  The project contains End-to-End tests in `apps/api/src/__tests__/e2e-workflows.test.ts` and stress tests. These are run as part of the `npm test` command and require a running database connection.

## 🏗️ Architecture & Tech Stack

- **Monorepo**: Turborepo with npm Workspaces
- **Backend**: Fastify, TypeScript
- **Frontend**: React (Vite), TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Testing**: Vitest

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
