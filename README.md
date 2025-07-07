# Adopte1Etudiant - Campus Job Matching Platform

## 🚀 Quick Start for Local Development

**New simplified setup - just Docker Compose!**

```bash
# 1. Setup project (one-time)
npm run setup

# 2. Update environment variables
# Edit apps/api/.env with your database and OAuth credentials

# 3. Start everything with Docker
npm run docker:dev
```

That's it! 🎉
- **API**: http://localhost:8080
- **Web**: http://localhost:5173  
- **Database**: localhost:5433

### Additional Commands

```bash
# Stop all services
npm run docker:dev:down

# Clean up and start fresh
npm run docker:dev:clean

# View database
npm run db:studio
```

---

## About

Adopte1Etudiant est une plateforme qui connecte les étudiants en fin de cycle avec les entreprises pour faciliter le processus de recrutement, en s'inspirant du concept d'Adopte Un Mec mais adapté au contexte professionnel.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Fastify + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Monorepo**: Turbo + npm workspaces

## 📁 Structure du projet

```
new_adopte1etudiant/
├── apps/
│   ├── api/          # Backend API (Fastify)
│   └── web/          # Frontend (React + Vite)
├── packages/
│   ├── core/         # Business logic
│   ├── db-postgres/  # Database utilities
│   └── shared-types/ # Type definitions
└── docs/            # Documentation
```

## 🔧 Development (Manual Setup)

Si vous préférez ne pas utiliser Docker:

```bash
# Install dependencies
npm install

# Setup environment
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your values

# Start database only
docker compose up postgres -d

# Start API (terminal 1)
npm run dev --workspace=apps/api

# Start Web (terminal 2)  
npm run dev --workspace=apps/web
```

## 🧪 Testing

```bash
npm test
```

## 🚀 Production Deployment

Production deployment is handled automatically via GitHub Actions when pushing to `main`. The CI/CD pipeline will:

1. Run tests
2. Build the application  
3. Deploy to production server

## 📚 Documentation

- [Architecture](docs/Architecture.md)
- [Development Guide](docs/Development-Guide.md)
- [Testing Guide](docs/Testing-Guide.md)
- [User Manual](docs/User-Manual.md)

# AdopteUnEtudiant

**Connecting the next generation of talent with future-forward companies in France.**

AdopteUnEtudiant is a modern web platform designed to bridge the gap between students seeking valuable work experience and companies looking for bright, emerging talent. Our mission is to simplify the search for internships and work-study programs (`alternance`), making it easier for students and companies to find the perfect match.

## ✨ Key Features

- **Dual-Role System**: Dedicated registration and profile management for both **Students** and **Companies**.
- **Effortless Job Posting**: Companies can easily create, manage, and promote internship and work-study opportunities.
- **Advanced Offer Search**: Students can filter job offers by skills, location, and contract type to find relevant opportunities quickly.
- **Direct Application & Messaging**: Students can apply directly to offers and communicate with companies through an integrated messaging system.
- **Proactive Recruitment**: Companies can search the student directory and send "Adoption Requests" to promising candidates.
- **Secure Authentication**: Robust and secure login with email/password or Google OAuth, ensuring user data is protected.

## 📚 Documentation & Project Wiki

This project is fully documented to meet academic and professional standards. All documentation is hosted in the `/docs` directory and serves as the project's official wiki.

- **[Home](docs/Home.md)**: Wiki entry point and documentation map.
- **[User Manual](docs/User-Manual.md)**: How-to guides for students and companies.
- **[Architecture Overview](docs/Architecture.md)**: A deep dive into the tech stack, infrastructure, and design patterns.
- **[Development Guide](docs/Development-Guide.md)**: Instructions for setting up the project locally and contributing.
- **[Database Guide](docs/Database-Guide.md)**: Details on the schema, migrations, and seeding.
- **[Authentication Flow](docs/Authentication.md)**: An explanation of the security and authentication mechanisms.
- **[CI/CD Pipeline](docs/CI-CD.md)**: The continuous integration and deployment workflow.
- **[Testing Strategy](docs/Testing-Guide.md)**: Our approach to ensuring code quality and stability.

## 🛠️ Tech Stack

- **Monorepo**: Turborepo with npm Workspaces
- **Backend**: Fastify, TypeScript
- **Frontend**: React (Vite), TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Testing**: Vitest (Coming Soon!)

## 🚀 Getting Started

To get the project running locally, please refer to the **[Development Guide](docs/Development-Guide.md)**.

## 🤝 Contributing

We welcome contributions! Please read our `CONTRIBUTING.md` (coming soon) to learn how you can get involved.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
