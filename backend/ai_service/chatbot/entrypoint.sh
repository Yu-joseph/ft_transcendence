#!/bin/sh
echo "waiting for database ..."
sleep 3



echo "Waiting for vault env files..."
until [ -s "/vault/aii/file.env" ]; do
    echo "vault env not ready, waiting..."
    sleep 2
done


python -c "
from app import app
from extensions import db
with app.app_context():
    db.create_all()
    print('Tables ready')
"

# exec gunicorn -w 4 -b 0.0.0.0:5000 app:app
exec gunicorn app:app -k gevent -w 4 -b 0.0.0.0:5000