from datetime import timedelta
from dotenv import load_dotenv
from pathlib import Path
import os
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-4vkpyy2bkd3(%hi=nhqdr(yx5j71%*zf!o!ej2kfnivhbno!%n'

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

if os.path.exists(VAULT_SECRETS_FILE):
    load_dotenv(VAULT_SECRETS_FILE)
    print("✅ Loaded database credentials from Vault")
else:
    print("⚠️  Vault secrets file not found, using environment variables")

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME':     os.getenv('DB_NAME',     'mydb'),
        'USER':     os.getenv('DB_USER',     'sayf'),   
        'PASSWORD': os.getenv('DB_PASSWORD', '1234'), 
        'HOST':     os.getenv('DB_HOST',     'db'),
        'PORT':     os.getenv('DB_PORT',     '5432'),
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

SOCIAL_AUTH_42_KEY    = 'u-s4t2ud-ded6e687b26b0218e9a66fafb8ed15c58b5d355add51059bbaea360d342f4143'
SOCIAL_AUTH_42_SECRET = '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'
FORTY_TWO_REDIRECT_URI = 'http://localhost:8080/authent/42/callback/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


SIMPLE_JWT = {
"ACCESS_TOKEN_LIFETIME": timedelta(hours=2), # change as needed
"REFRESH_TOKEN_LIFETIME": timedelta(days=14), # change as needed
"ROTATE_REFRESH_TOKENS": False,
"BLACKLIST_AFTER_ROTATION": False,
}

ACCESS_TOKEN_COOKIE_MAX_AGE = int(SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds())
REFRESH_TOKEN_COOKIE_MAX_AGE = int(SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds())