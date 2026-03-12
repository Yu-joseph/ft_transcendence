# Stage 1: Build React
FROM node:20-alpine AS frontend
WORKDIR /app
COPY llm-studio/package*.json .
RUN npm install
COPY llm-studio/ .
RUN npm run build

# Stage 2: Python backend
FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /app
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Copy React build
COPY --from=frontend /app/dist /app/static/llm-studio

EXPOSE 5000
CMD ["python", "backend/app.py"]