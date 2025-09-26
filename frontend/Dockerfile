FROM node:20-slim

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm ci --silent

COPY . .

ARG NODE_ENV=production
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ARG NEXT_PUBLIC_NODE_ENV=production
ARG NEXT_PUBLIC_PORT=3000

# Set environment variables
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_NODE_ENV=${NEXT_PUBLIC_NODE_ENV}
ENV NEXT_PUBLIC_PORT=${NEXT_PUBLIC_PORT}

# Debug information
RUN echo "Node version: $(node --version)"
RUN echo "NPM version: $(npm --version)"
RUN echo "Build environment: $NODE_ENV"
RUN echo "API URL: $NEXT_PUBLIC_API_URL"

# Build with memory optimization
RUN npm run build

# Runtime environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]