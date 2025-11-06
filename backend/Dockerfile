FROM node:18-alpine

WORKDIR /app

# Create user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Ensure app directory is writable by nodejs before installing deps
RUN chown -R nodejs:nodejs /app

# Copy package files
COPY --chown=nodejs:nodejs package*.json ./

# Install dependencies as nodejs user
USER nodejs
RUN npm ci --only=production
USER root

# Build arguments
ARG NODE_ENV=production
ARG DB_HOST
ARG DB_NAME
ARG DB_PASSWORD
ARG DB_PORT
ARG DB_USER
ARG BACKEND_PORT

# Set environment variables
ENV NODE_ENV=${NODE_ENV}
ENV DB_HOST=${DB_HOST}
ENV DB_NAME=${DB_NAME}
ENV DB_PASSWORD=${DB_PASSWORD}
ENV DB_PORT=${DB_PORT}
ENV DB_USER=${DB_USER}
ENV BACKEND_PORT=${BACKEND_PORT}

# Copy source code with correct ownership
COPY --chown=nodejs:nodejs . .

USER nodejs

EXPOSE 3001

CMD ["npm", "start"]
