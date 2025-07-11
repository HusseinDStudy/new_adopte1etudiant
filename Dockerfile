# Dockerfile for building both the API and Web applications

# --- Stage 1: Base image for dependency installation ---
FROM node:20-slim as base
RUN corepack enable
# Install OpenSSL and other dependencies needed for Prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean
WORKDIR /app

# --- Stage 2: Webapp Builder ---
FROM base as web-builder
WORKDIR /app
COPY turbo.json package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/
RUN npm install --ignore-scripts && npm cache clean --force
COPY . .
RUN npx turbo build --filter=web

# --- Stage 3: API Builder ---
FROM base as api-builder
WORKDIR /app
COPY turbo.json package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/core/package.json ./packages/core/
COPY packages/db-postgres/package.json ./packages/db-postgres/
COPY packages/shared-types/package.json ./packages/shared-types/
RUN npm install --ignore-scripts && npm cache clean --force
COPY . .
# Generate prisma client for build stage, specifying the schema path
RUN npx prisma generate --schema=./apps/api/prisma/schema.prisma
# Build the application
RUN npx turbo build --filter=api

# --- Stage 4: Production Web Server ---
FROM nginx:1.25-alpine as web
WORKDIR /usr/share/nginx/html
RUN rm -rf /usr/share/nginx/html/*
COPY --from=web-builder /app/apps/web/dist .
# Add a basic Nginx config for SPAs
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# --- Stage 5: Production API Server ---
FROM node:20-alpine as api
# Install OpenSSL, wget, and ca-certificates for Prisma compatibility and health checks
RUN apk add --no-cache openssl wget ca-certificates && \
    rm -rf /var/cache/apk/*
WORKDIR /app
# Set OpenSSL configuration
ENV OPENSSL_CONF=/etc/ssl/openssl.cnf

# Copy package files first for dependency installation
COPY --from=api-builder /app/package.json .
COPY --from=api-builder /app/apps/api/package.json ./
COPY --from=api-builder /app/packages ./packages

# Copy package.json files for workspace packages
COPY --from=api-builder /app/packages/core/package.json ./packages/core/
COPY --from=api-builder /app/packages/db-postgres/package.json ./packages/db-postgres/
COPY --from=api-builder /app/packages/shared-types/package.json ./packages/shared-types/

# Install production dependencies in Alpine environment
RUN npm install --production --ignore-scripts && npm cache clean --force

# Copy Prisma schema and migrations for runtime
COPY --from=api-builder /app/apps/api/prisma ./prisma/

# Generate Prisma client for Alpine/musl environment
ENV PRISMA_CLIENT_ENGINE_TYPE=binary
RUN npx prisma generate

# Copy built application files
COPY --from=api-builder /app/apps/api/dist ./dist
COPY --from=api-builder /app/packages/core/dist ./packages/core/dist
COPY --from=api-builder /app/packages/db-postgres/dist ./packages/db-postgres/dist
COPY --from=api-builder /app/packages/shared-types/dist ./packages/shared-types/dist

# Expose the port the API runs on
EXPOSE 8080
CMD ["node", "dist/index.js"] 