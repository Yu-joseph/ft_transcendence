{{ with secret "database/creds/game-readwrite" }}
DB_HOST=chat_db
DB_PORT=5432
DB_NAME=chatbot_db
DB_USER={{ .Data.username }}
DB_PASSWORD={{ .Data.password }}
DATABASE_URL=postgres://{{ .Data.username }}:{{ .Data.password }}@chat_db:5432/chatbot_db
{{ end }}