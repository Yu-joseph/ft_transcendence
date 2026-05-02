{{ with secret "secret/data/myapp/apis" }}
DJANGO_SECRET_KEY={{ .Data.data.django_secret_key }}
SOCIAL_AUTH_42_SECRET={{ .Data.data.social_secret_fortytwo }}
SOCIAL_AUTH_42_KEY={{ .Data.data.fortytwo_key_auth }}
{{ end }}