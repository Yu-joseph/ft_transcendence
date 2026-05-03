{{ with secret "secret/data/myapp/apis" }}
OPENAI_API_KEY={{ .Data.data.openai_api_key }}
DJANGO_SECRET_KEY={{ .Data.data.django_secret_key }}
GROQ_API_KEY={{ .Data.data.grok_secret_key }}
SOCIAL_AUTH_42_SECRET={{ .Data.data.social_secret_fortytwo }}
SOCIAL_AUTH_42_KEY={{ .Data.data.fortytwo_key_auth }}
{{ end }}