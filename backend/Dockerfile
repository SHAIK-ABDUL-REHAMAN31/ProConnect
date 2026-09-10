# ==========================================
# ProConnect 2.0 Backend Dockerfile
# Production-ready, non-root Node.js image
# ==========================================

FROM node:20-alpine AS base

# Install security updates & dumb-init for proper signal handling (SIGTERM, SIGINT)
RUN apk add --no-cache dumb-init

WORKDIR /app

# Step 1: Cache dependencies layer
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Step 2: Copy application source
COPY . .

# Create uploads directory and set permissions for non-root 'node' user
RUN mkdir -p uploads && chown -R node:node /app

# Switch to unprivileged 'node' user (Security Hardening)
USER node

EXPOSE 3030

ENV PORT=3030 \
    NODE_ENV=production

# dumb-init ensures Node handles PID 1 signals cleanly for graceful shutdown
CMD ["dumb-init", "node", "server.js"]
