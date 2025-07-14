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
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
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
COPY --from=api-builder /app/apps/api/package.json ./apps/api/
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
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copy built application files
COPY --from=api-builder /app/apps/api/dist ./dist
COPY --from=api-builder /app/packages/core/dist ./packages/core/dist
COPY --from=api-builder /app/packages/db-postgres/dist ./packages/db-postgres/dist
COPY --from=api-builder /app/packages/shared-types/dist ./packages/shared-types/dist

# Create proper package structure for workspace packages
RUN mkdir -p ./packages/db-postgres && \
    cp -r ./packages/db-postgres/dist/* ./packages/db-postgres/ && \
    mkdir -p ./packages/core && \
    cp -r ./packages/core/dist/* ./packages/core/ && \
    mkdir -p ./packages/shared-types && \
    cp -r ./packages/shared-types/dist/* ./packages/shared-types/

# Debug: Check if packages are properly installed and accessible
RUN ls -la node_modules/ | grep -E "(db-postgres|core|shared-types)" || echo "No workspace packages found in node_modules" && \
    ls -la node_modules/.prisma/client/ || echo "Prisma client not found in node_modules" && \
    echo "=== Package structure ===" && \
    ls -la packages/ && \
    echo "=== db-postgres package ===" && \
    ls -la packages/db-postgres/ || echo "db-postgres package not found"

# Ensure packages are properly linked in node_modules
RUN if [ ! -L "node_modules/db-postgres" ]; then \
        ln -sf /app/packages/db-postgres node_modules/db-postgres; \
    fi && \
    if [ ! -L "node_modules/core" ]; then \
        ln -sf /app/packages/core node_modules/core; \
    fi && \
    if [ ! -L "node_modules/shared-types" ]; then \
        ln -sf /app/packages/shared-types node_modules/shared-types; \
    fi

# Final verification
RUN echo "=== Final verification ===" && \
    ls -la node_modules/ | grep -E "(db-postgres|core|shared-types)" && \
    echo "=== Testing package import ===" && \
    node -e "try { require('db-postgres'); console.log('✅ db-postgres package found'); } catch(e) { console.log('❌ db-postgres package not found:', e.message); }" || echo "Package test failed"

# Expose the port the API runs on
EXPOSE 8080
CMD ["node", "dist/index.js"] 