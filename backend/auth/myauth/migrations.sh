#!/bin/sh

sleep 5

python3 manage.py makemigrations

python3 manage.py migrate

exec "$@"