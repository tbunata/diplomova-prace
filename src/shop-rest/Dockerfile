FROM node:17 as base

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

FROM base as production

ENV NODE_ENV=production