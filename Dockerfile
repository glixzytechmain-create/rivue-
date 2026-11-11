# ==============================================================================
# RIVUE PRODUCTION DOCKERFILE (24/7 Standalone Cloud Deployment)
# Serves both the Forensic API Engine and Web Dashboard
# ==============================================================================

FROM node:20-slim AS builder

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci || (cd backend && npm install)

# Copy source and build TypeScript
COPY backend ./backend
COPY web ./web
RUN cd backend && npm run build

# Production runtime container
FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy production dependencies only
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy compiled dist and frontend assets
COPY --from=builder /app/backend/dist ./backend/dist
COPY web ./web

EXPOSE 3001

CMD ["node", "backend/dist/server.js"]
