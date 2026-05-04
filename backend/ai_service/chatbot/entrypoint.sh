#!/bin/sh

echo "waiting for database ..."
sleep 2
flask db upgrade
exec gunicorn  -w 4 -b 0.0.0.0:5000 app:app