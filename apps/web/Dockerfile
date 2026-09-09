# --- BUILD STAGE ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root configurations for monorepo
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Install dependencies
RUN npm ci

# Copy frontend codebase
COPY apps/web/ ./apps/web/

# Build Next.js app with production environment
RUN npm run build:prod --workspace=apps/web

# --- PRODUCTION STAGE ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Install only production dependencies
RUN npm ci --only=production

# Copy built next project
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/next.config.ts ./apps/web/next.config.ts

EXPOSE 3000

# Start next server
CMD ["npm", "run", "start:prod", "--workspace=apps/web"]
