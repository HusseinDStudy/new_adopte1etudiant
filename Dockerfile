# 1. Builder stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root dependency files
COPY package.json pnpm-lock.yaml ./
COPY turbo.json turbo.json

# Copy app/package-specific files
COPY apps/api/package.json ./apps/api/
COPY packages/core/package.json ./packages/core/
COPY packages/db-postgres/package.json ./packages/db-postgres/
COPY packages/shared-types/package.json ./packages/shared-types/

# Install all dependencies
RUN npm i -g pnpm && pnpm install --filter api...

# Copy source code
COPY . .

# Generate Prisma client and build the API
RUN pnpm --filter api run build

# 2. Runner stage
FROM node:20-alpine
WORKDIR /app

# Copy only production artifacts from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/.env.example ./apps/api/.env

ENV NODE_ENV=production

# Expose port and start the server
EXPOSE 8080
CMD ["node", "apps/api/dist/index.js"] 