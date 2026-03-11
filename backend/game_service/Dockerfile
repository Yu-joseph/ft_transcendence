FROM node:20-alpine

WORKDIR /app

COPY api/package.json api/package-lock.json* ./
RUN npm install

COPY api/prisma ./prisma
RUN npx prisma generate

COPY api/ .
RUN npm run build

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]