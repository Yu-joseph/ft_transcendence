from datetime import timedelta
from dotenv import load_dotenv
from pathlib import Path
import os
BASE_DIR = Path(__file__).resolve().parent.parent


DEBUG = True

ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.postgres',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'authentication',
]


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware', 
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'myauth.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'social_django.context_processors.backends',    
                'social_django.context_processors.login_redirect',
            ],
        },
    },
]


WSGI_APPLICATION = 'myauth.wsgi.application'

VAULT_SECRETS_FILE = '/vault/secrets/database.env'

while True:
    if os.path.exists(VAULT_SECRETS_FILE):
        break
        

load_dotenv(VAULT_SECRETS_FILE)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME':     os.getenv('DB_NAME'),
        'USER':     os.getenv('DB_USER'),   
        'PASSWORD': os.getenv('DB_PASSWORD'), 
        'HOST':     os.getenv('DB_HOST'),
        'PORT':     os.getenv('DB_PORT'),
    }
}

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

MEDIA_URL = '/media/'

STATIC_URL = 'static/'

STATIC_ROOT = '/app/static'
SOCIAL_AUTH_URL_NAMESPACE = 'social'

FORTY_TWO_REDIRECT_URI = 'http://localhost:8080/authent/42/callback/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

DJANGO_FILE_SC = '/vault/chat/file.env'
load_dotenv(DJANGO_FILE_SC)
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')
SOCIAL_AUTH_42_KEY    = os.getenv('SOCIAL_AUTH_42_KEY')
SOCIAL_AUTH_42_SECRET = os.getenv('SOCIAL_AUTH_42_SECRET')

SIMPLE_JWT = {
"ACCESS_TOKEN_LIFETIME": timedelta(hours=2), # change as needed
"REFRESH_TOKEN_LIFETIME": timedelta(days=14), # change as needed
"ROTATE_REFRESH_TOKENS": False,
"BLACKLIST_AFTER_ROTATION": False,
}

ACCESS_TOKEN_COOKIE_MAX_AGE = int(SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds())
REFRESH_TOKEN_COOKIE_MAX_AGE = int(SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds())