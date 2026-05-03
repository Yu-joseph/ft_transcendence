FROM node:20-alpine

WORKDIR /app

COPY api/package*.json ./
RUN npm install

COPY api/ .

CMD ["sh", "-c", "npx prisma db pull && npx prisma generate && npm run dev"]
