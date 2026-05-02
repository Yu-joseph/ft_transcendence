{{ with secret "secret/data/myapp/apis" }}
DJANGO_SECRET_KEY={{ .Data.data.django_secret_key }}
{{ end }}