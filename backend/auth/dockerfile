FROM python:3.13-slim 

WORKDIR /app

COPY /myauth/* /app/
 
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1 
 
RUN pip install --upgrade pip 
 
RUN pip install --no-cache-dir -r requirements.txt

CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
