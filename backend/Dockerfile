FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

USER nodejs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["npm", "start"]
