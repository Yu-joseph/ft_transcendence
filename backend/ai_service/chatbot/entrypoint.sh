#!/bin/sh
echo "waiting for database ..."
sleep 3

# Wait for vault-agent to write env files
echo "Waiting for vault env files..."
until [ -s "/vault/aii/file.env" ]; do
    echo "vault env not ready, waiting..."
    sleep 2
done
echo "Vault env ready ✅"

if [ ! -f "migrations/env.py" ]; then
    flask db init
fi

python -c "
from app import app
from extensions import db
with app.app_context():
    with db.engine.connect() as conn:
        conn.execute(db.text('DELETE FROM alembic_version'))
        conn.commit()
" 2>/dev/null || true

rm -f migrations/versions/*.py

OUTPUT=$(flask db migrate -m "auto" 2>&1)
echo "$OUTPUT"

if echo "$OUTPUT" | grep -q "No changes in schema detected"; then
    echo "No changes — DB already in sync"
else
    echo "Changes detected — applying migration"
    flask db upgrade
fi

exec gunicorn -w 4 -b 0.0.0.0:5000 app:app