FROM python:3.13-slim 

WORKDIR /app

COPY myauth/ /app/

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1 
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
RUN pip install --upgrade pip 
RUN pip install --no-cache-dir -r requirements.txt

RUN chmod +x /app/migrations.sh


ENTRYPOINT ["/app/migrations.sh"]

CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]

