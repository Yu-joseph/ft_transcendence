#!/bin/sh

sleep 4

python3 manage.py makemigrations

python3 manage.py migrate

exec "$@"