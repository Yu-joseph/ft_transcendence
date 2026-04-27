{{ with secret "database/creds/main-readwrite" }}
DB_HOST=db
DB_PORT=5432
DB_NAME=mydb
DB_USER={{ .Data.username }}
DB_PASSWORD={{ .Data.password }}
DATABASE_URL=postgres://{{ .Data.username }}:{{ .Data.password }}@db:5432/mydb
{{ end }}