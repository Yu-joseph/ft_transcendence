FROM python:3.13-slim 

WORKDIR /app

COPY myauth/ /app/
# COPY migrations.sh /app/

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1 
 
RUN pip install --upgrade pip 
RUN pip install --no-cache-dir -r requirements.txt

<<<<<<< HEAD:backend/auth/Dockerfile
RUN chmod +x /app/migrations.sh

ENTRYPOINT ["/app/migrations.sh"]

CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
=======
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
>>>>>>> 2d98fb0 (SA):backend/auth/dockerfile
