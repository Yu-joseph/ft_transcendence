FROM node:20

WORKDIR /app

COPY *.json ./

RUN npm install

COPY . .
COPY pulling.sh /app/pulling.sh
RUN chmod +x /app/pulling.sh

EXPOSE 3000

ENTRYPOINT ["sh", "/app/pulling.sh"]