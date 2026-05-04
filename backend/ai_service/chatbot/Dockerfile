FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc libpq-dev

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .



# CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]


CMD [ "sh" , "entrypoint.sh" ]