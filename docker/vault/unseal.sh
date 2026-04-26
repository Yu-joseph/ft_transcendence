#!/bin/sh
export VAULT_ADDR="https://vault:8200"
export VAULT_CACERT="/vault/userconfig/tls/ca.crt"

INIT_FILE="/vault/userconfig/vault-init.json"
APPROLE_FILE="/vault/userconfig/approle-creds.json"

# ============================================
# 1. INIT
# ============================================
INITIALIZED=$(vault status -format=json 2>/dev/null | jq -r '.initialized')
if [ "$INITIALIZED" = "false" ]; then
  vault operator init \
    -key-shares=5 \
    -key-threshold=3 \
    -format=json > "$INIT_FILE"
  echo "Vault initialized"
fi

if [ ! -f "$INIT_FILE" ] || [ ! -s "$INIT_FILE" ]; then
  echo "ERROR: $INIT_FILE not found or empty, cannot continue"
  exit 1
fi

# ============================================
# 2. UNSEAL
# ============================================
SEALED=$(vault status -format=json 2>/dev/null | jq -r '.sealed')
if [ "$SEALED" = "true" ]; then
  vault operator unseal $(jq -r '.unseal_keys_b64[0]' "$INIT_FILE")
  vault operator unseal $(jq -r '.unseal_keys_b64[1]' "$INIT_FILE")
  vault operator unseal $(jq -r '.unseal_keys_b64[2]' "$INIT_FILE")
  echo "Vault unsealed"
fi

export VAULT_TOKEN=$(jq -r '.root_token' "$INIT_FILE")

# ============================================
# 3. KV SECRETS ENGINE
# ============================================
vault secrets enable -path=secret kv-v2 2>/dev/null || true

if [ "$INITIALIZED" = "false" ]; then
  vault kv put secret/myapp/database \
    username="${DB_USER:-sayf}" \
    password="${DB_PASS:-1234}" \
    host="${DB_HOST:-db}" \
    port="${DB_PORT:-5432}"
  echo "Static credentials stored"
fi

# ============================================
# 4. DATABASE SECRETS ENGINE
# ============================================
vault secrets enable database 2>/dev/null || true

if [ "$INITIALIZED" = "false" ]; then

  # --- main database ---
  vault write database/config/main-postgres \
    plugin_name=postgresql-database-plugin \
    allowed_roles="main-readonly,main-readwrite" \
    connection_url="postgresql://{{username}}:{{password}}@db:5432/mydb?sslmode=disable" \
    username="sayf" \
    password="1234"

  vault write database/roles/main-readonly \
    db_name=main-postgres \
    creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; \
      GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
    revocation_statements="DROP ROLE IF EXISTS \"{{name}}\";" \
    default_ttl="1h" \
    max_ttl="24h"

  vault write database/roles/main-readwrite \
    db_name=main-postgres \
    creation_statements="
      CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}';
      GRANT ALL PRIVILEGES ON DATABASE mydb TO \"{{name}}\";
      GRANT USAGE ON SCHEMA public TO \"{{name}}\";
      GRANT CREATE ON SCHEMA public TO \"{{name}}\";
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO \"{{name}}\";
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO \"{{name}}\";
    " \
    revocation_statements="DROP ROLE IF EXISTS \"{{name}}\";" \
    default_ttl="1h" \
    max_ttl="24h"

  # --- game database ---
  vault write database/config/game-postgres \
    plugin_name=postgresql-database-plugin \
    allowed_roles="game-readonly,game-readwrite" \
    connection_url="postgresql://{{username}}:{{password}}@postgres:5432/chatbot_db?sslmode=disable" \
    username="${DB_USER:-BRAHIM}" \
    password="${DB_PASSWORD:-0000}"

  vault write database/roles/game-readonly \
    db_name=game-postgres \
    creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; \
      GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
    revocation_statements="DROP ROLE IF EXISTS \"{{name}}\";" \
    default_ttl="1h" \
    max_ttl="24h"

  vault write database/roles/game-readwrite \
    db_name=game-postgres \
    creation_statements="
      CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}';
      GRANT ALL PRIVILEGES ON DATABASE chatbot_db TO \"{{name}}\";
      GRANT USAGE ON SCHEMA public TO \"{{name}}\";
      GRANT CREATE ON SCHEMA public TO \"{{name}}\";
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO \"{{name}}\";
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO \"{{name}}\";
    " \
    revocation_statements="DROP ROLE IF EXISTS \"{{name}}\";" \
    default_ttl="1h" \
    max_ttl="24h"

  echo "Database engines configured"
fi

# ============================================
# 5. APPROLE AUTH
# ============================================
vault auth enable approle 2>/dev/null || true

vault policy write myapp-policy - <<EOF
path "secret/data/myapp/*" {
  capabilities = ["read"]
}
path "database/creds/main-readonly" {
  capabilities = ["read"]
}
path "database/creds/main-readwrite" {
  capabilities = ["read"]
}
path "database/creds/game-readonly" {
  capabilities = ["read"]
}
path "database/creds/game-readwrite" {
  capabilities = ["read"]
}
EOF

vault write auth/approle/role/my-role \
  token_policies="myapp-policy" \
  token_ttl="1h" \
  token_max_ttl="4h" \
  secret_id_ttl="0" \
  secret_id_num_uses=0

if [ "$INITIALIZED" = "false" ] || [ ! -s "$APPROLE_FILE" ]; then
  ROLE_ID=$(vault read -field=role_id auth/approle/role/my-role/role-id)
  SECRET_ID=$(vault write -f -field=secret_id auth/approle/role/my-role/secret-id)
  printf '{"role_id":"%s","secret_id":"%s"}\n' "$ROLE_ID" "$SECRET_ID" > "$APPROLE_FILE"
  chmod 644 "$APPROLE_FILE"
  echo "AppRole credentials saved to $APPROLE_FILE"
fi

# ============================================
# 6. GRANT SCHEMA PERMISSIONS ON POSTGRES
# ============================================
if [ "$INITIALIZED" = "false" ]; then
  echo "Waiting for postgres..."
  until pg_isready -h db -p 5432 -U sayf 2>/dev/null; do
    sleep 2
  done

  PGPASSWORD="1234" psql -h db -p 5432 -U sayf -d mydb <<SQL
  GRANT ALL ON SCHEMA public TO PUBLIC;
  ALTER DEFAULT PRIVILEGES FOR ROLE sayf IN SCHEMA public
    GRANT ALL ON TABLES TO PUBLIC;
  ALTER DEFAULT PRIVILEGES FOR ROLE sayf IN SCHEMA public
    GRANT ALL ON SEQUENCES TO PUBLIC;
SQL
  echo "✅ Schema permissions granted"
fi

echo "✅ Vault setup complete"