FROM node:20-alpine

WORKDIR /app

COPY api/package*.json ./
RUN npm ci

COPY api/ .

RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

CMD ["npm", "start"]
