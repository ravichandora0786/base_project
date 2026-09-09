# --- BUILD STAGE ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install OpenSSL and libc6-compat for Prisma engine detection
RUN apk add --no-cache openssl libc6-compat

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

# Install OpenSSL and libc6-compat for Prisma runtime
RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install only production dependencies
RUN npm ci --only=production

# Copy built application and prisma client from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 4000

CMD ["node", "apps/api/dist/src/main.js"]
