#!/bin/sh
set -e

if [ -f /vault/secrets/database.env ]; then
  # Double-quote to handle values with spaces
  export $(grep -v '^\s*#' /vault/secrets/database.env | grep -v '^\s*$' | xargs -d '\n')
else
  echo "ERROR: /vault/secrets/database.env not found"
  exit 1
fi

npx prisma db pull
npx prisma generate
exec npm run dev