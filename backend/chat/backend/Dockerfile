FROM node:20

WORKDIR /app

COPY *.json ./

RUN npm install

COPY . .

ENV DATABASE_URL=postgres://sayf:1234@db:5432/mydb
# Generate client from schema (run `prisma db pull` locally when DB is up, then commit schema)
# RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db pull && npx prisma generate && npm run dev"]