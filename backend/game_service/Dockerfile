FROM node:20

WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY api/package*.json ./
RUN npm install

COPY api/ .
RUN chmod +x /app/pulling.sh

CMD ["sh", "-c", "npx prisma db pull && npx prisma generate && npm run dev"]
