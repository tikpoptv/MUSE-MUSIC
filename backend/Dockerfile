FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache python3 py3-pip python3-dev gcc musl-dev

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nodejs

RUN chown -R nodejs:nodejs /app

COPY --chown=nodejs:nodejs package*.json ./

USER nodejs
RUN npm ci --only=production
USER root

ARG NODE_ENV=production
ARG DB_HOST
ARG DB_NAME
ARG DB_PASSWORD
ARG DB_PORT
ARG DB_USER
ARG BACKEND_PORT

ENV NODE_ENV=${NODE_ENV}
ENV DB_HOST=${DB_HOST}
ENV DB_NAME=${DB_NAME}
ENV DB_PASSWORD=${DB_PASSWORD}
ENV DB_PORT=${DB_PORT}
ENV DB_USER=${DB_USER}
ENV BACKEND_PORT=${BACKEND_PORT}

COPY --chown=nodejs:nodejs . .

RUN rm -rf /app/.transcript-venv \
  && python3 -m venv /app/.transcript-venv \
  && /app/.transcript-venv/bin/python -m pip install --upgrade pip \
  && /app/.transcript-venv/bin/python -m pip install -r python/requirements.txt \
  && chown -R nodejs:nodejs /app/.transcript-venv

USER nodejs

EXPOSE 3001

CMD ["npm", "start"]
