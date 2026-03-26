FROM node:20-alpine

WORKDIR /app

COPY api/package*.json ./
RUN npm install

COPY api/ .

RUN npm run build

ENV DATABASE_URL=postgres://sayf:1234@db:5432/mydb

CMD ["sh", "-c", "npx prisma db pull && npx prisma generate && npm start"]