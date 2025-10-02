FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --include=dev

# Copy source
COPY . .

# Build-time args for public envs
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ARG NEXT_PUBLIC_NODE_ENV=production
ARG NEXT_PUBLIC_PORT=3000

# Ensure production build behavior regardless of external NODE_ENV build-arg
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_NODE_ENV=${NEXT_PUBLIC_NODE_ENV}
ENV NEXT_PUBLIC_PORT=${NEXT_PUBLIC_PORT}

# Build Next.js (standalone output configured in next.config.ts)
RUN npm run build

# --- Runtime image ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy the standalone server and static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "/app/server.js"]
