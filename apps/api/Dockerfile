# --- BUILD STAGE ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root configurations for monorepo
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy backend codebase
COPY apps/api/ ./apps/api/

# Generate Prisma Client
RUN npm run prisma:generate

# Build the NestJS project
RUN npm run build --workspace=apps/api

# --- PRODUCTION STAGE ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install only production dependencies
RUN npm ci --only=production

# Copy built application and prisma client from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 3000

CMD ["node", "apps/api/dist/main.js"]
