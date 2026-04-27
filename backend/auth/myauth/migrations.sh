#!/bin/sh

sleep 7

python3 manage.py makemigrations

python3 manage.py migrate

exec "$@"