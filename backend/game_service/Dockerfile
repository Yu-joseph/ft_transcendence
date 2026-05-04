FROM node:20

WORKDIR /app

COPY api/package*.json ./
RUN npm install

COPY api/ .
RUN chmod +x /app/pulling.sh

ENTRYPOINT ["sh", "/app/pulling.sh"]