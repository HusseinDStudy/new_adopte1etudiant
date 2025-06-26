# Campus ↔ Entreprise MVP

A platform connecting French students with companies for internships and alternance opportunities.

## 🚀 Quick Start

### Prerequisites

- Node.js (v20+)
- pnpm (v8+)
- Docker & Docker Compose

### Setup Commands

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Setup environment variables**:

   ```bash
   pnpm turbosetup
   ```

3. **Start the database**:

   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**:

   ```bash
   pnpm db:migrate:dev
   ```

5. **Start development servers**:
   ```bash
   pnpm dev
   ```

- API: http://localhost:8080
- Frontend: http://localhost:5173

## 📁 Project Structure

```
adopte1etudiant-mvp/
├── apps/
│   ├── api/                 # Fastify backend server
│   └── web/                 # React frontend application
├── packages/
│   ├── core/                # Pure domain logic
│   ├── db-postgres/         # Prisma client
│   ├── shared-types/        # Shared validation schemas
│   └── tsconfig/            # Shared TypeScript configs
```

## 🛠️ Development

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm test` - Run tests
- `pnpm db:studio` - Open Prisma Studio

## 🚀 Deployment

The project includes Docker configuration for production deployment:

```bash
docker build -t adopte1etudiant-api .
docker run -p 8080:8080 adopte1etudiant-api
```

## 📋 MVP Features

- ✅ User authentication (email/password)
- ✅ Student and Company profiles
- ✅ Internship/Alternance offers
- ✅ Application management
- ✅ In-app messaging
- ✅ Search and filtering
- ✅ Dashboards for both user types
