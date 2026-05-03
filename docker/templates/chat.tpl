{{ with secret "secret/data/myapp/apis" }}
SECRET_KEY={{ .Data.data.django_secret_key }}
{{ end }}