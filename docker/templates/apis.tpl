{{ with secret "secret/data/myapp/apis" }}
OPENAI_API_KEY={{ .Data.data.openai_api_key }}
DJANGO_SECRET_KEY={{ .Data.data.django_secret_key }}
GROQ_API_KEY={{ .Data.data.grok_secret_key }}
{{ end }}