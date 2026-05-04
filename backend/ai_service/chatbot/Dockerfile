FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc libpq-dev

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .


RUN  chmod 777  entrypoint.sh
CMD [ "sh", "entrypoint.sh" ]