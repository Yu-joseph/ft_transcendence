import os
from dotenv import load_dotenv

load_dotenv()


class AppConfig:
    SQLALCHEMY_DATABASE_URI = (
        f"postgresql://{os.environ.get('DB_USER')}:"
        f"{os.environ.get('DB_PASSWORD')}@"
        f"{os.environ.get('DB_HOST')}:"
        f"{os.environ.get('DB_PORT')}/"
        f"{os.environ.get('DB_NAME')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 1800,
        'pool_pre_ping': True,
    }

    UPLOAD_FOLDER     = "/app/uploads"
    DJANGO_SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")
