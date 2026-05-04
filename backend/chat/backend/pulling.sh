#!/bin/sh
set -e

if [ -f /vault/secrets/database.env ]; then
  export $(grep -v '^\s*#' /vault/secrets/database.env | grep -v '^\s*$' | xargs -d '\n')
else
  echo "ERROR: /vault/secrets/database.env not found"
  exit 1
fi

npx prisma db pull
npx prisma generate
exec npx tsx watch src/server.ts