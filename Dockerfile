FROM node:24-alpine AS base

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY src/ ./src/

EXPOSE 5000

USER node

CMD ["node", "src/index.js"]
