#!/bin/sh

VAULT_ADDR="https://vault:8200"
VAULT_CACERT="/vault/certs/ca.crt"
CREDS_FILE="/vault/userconfig/approle-creds.json"
export DOCKER_API_VERSION=1.49
echo "Waiting for Vault to be reachable..."
until vault status -address="$VAULT_ADDR" -ca-cert="$VAULT_CACERT" 2>/dev/null; do
  echo "  vault not reachable, retrying in 2s..."
  sleep 2
done

echo "Waiting for Vault to be unsealed..."
until [ "$(vault status -address="$VAULT_ADDR" -ca-cert="$VAULT_CACERT" -format=json 2>/dev/null | grep -o '"sealed":[^,}]*' | cut -d: -f2 | tr -d ' ')" = "false" ]; do
  echo "  vault is sealed, retrying in 3s..."
  sleep 3
done

echo "Waiting for approle-creds.json to be ready..."
until [ -f "$CREDS_FILE" ] && [ -s "$CREDS_FILE" ]; do
  echo "  creds not ready, retrying in 2s..."
  sleep 2
done
echo "✅ approle-creds.json is ready"

ROLE_ID=$(cat "$CREDS_FILE" | grep -o '"role_id":"[^"]*"' | cut -d'"' -f4)
SECRET_ID=$(cat "$CREDS_FILE" | grep -o '"secret_id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ROLE_ID" ] || [ -z "$SECRET_ID" ]; then
  echo "ERROR: failed to parse credentials"
  echo "File content: $(cat $CREDS_FILE)"
  exit 1
fi

printf '%s' "$ROLE_ID"   > /vault/role-id
printf '%s' "$SECRET_ID" > /vault/secret-id

echo "Starting vault-agent..."
exec vault agent -config=/vault/config/agent.hcl