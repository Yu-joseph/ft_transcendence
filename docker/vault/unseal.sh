#!/bin/sh
export VAULT_ADDR="https://vault:8200"
export VAULT_CACERT="/vault/userconfig/tls/ca.crt"

INIT_FILE="/vault/userconfig/vault-init.json"
APPROLE_FILE="/vault/userconfig/approle-creds.json"

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

SEALED=$(vault status -format=json 2>/dev/null | jq -r '.sealed')
if [ "$SEALED" = "true" ]; then
  vault operator unseal $(jq -r '.unseal_keys_b64[0]' "$INIT_FILE")
  vault operator unseal $(jq -r '.unseal_keys_b64[1]' "$INIT_FILE")
  vault operator unseal $(jq -r '.unseal_keys_b64[2]' "$INIT_FILE")
  echo "Vault unsealed"
fi

export VAULT_TOKEN=$(jq -r '.root_token' "$INIT_FILE")

vault secrets enable -path=secret kv-v2 2>/dev/null || true

if [ "$INITIALIZED" = "false" ]; then
  vault kv put secret/myapp/apis \
    openai_api_key="${OPENROUTER_API_KEY}" \
    django_secret_key="${DJANGO_SECRET_KEY}"\
    grok_secret_key="${GROQ_API_KEY}"\
    social_secret_fortytwo="${SOCIAL_AUTH_42_SECRET}"\
    fortytwo_key_auth="${SOCIAL_AUTH_42_KEY}"
fi

vault secrets enable database 2>/dev/null || true

if [ "$INITIALIZED" = "false" ]; then

  vault write database/config/main-postgres \
    plugin_name=postgresql-database-plugin \
    allowed_roles="main-readonly,main-readwrite" \
    connection_url="postgresql://{{username}}:{{password}}@db:5432/mydb?sslmode=disable" \
    username="${ft_user}" \
    password="${ft_password}"

  vault write database/roles/main-readonly \
    db_name=main-postgres \
    creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; \
      GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
    revocation_statements="DROP ROLE IF EXISTS \"{{name}}\";" \
    default_ttl="1h" \
    max_ttl="3h"

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
    max_ttl="3h"

  vault write database/config/game-postgres \
    plugin_name=postgresql-database-plugin \
    allowed_roles="game-readonly,game-readwrite" \
    connection_url="postgresql://{{username}}:{{password}}@chat_db:5432/chatbot_db?sslmode=disable" \
    username="${DB_USER}" \
    password="${DB_PASSWORD}"

  vault write database/roles/game-readonly \
    db_name=game-postgres \
    creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; \
      GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
    revocation_statements="DROP ROLE IF EXISTS \"{{name}}\";" \
    default_ttl="1h" \
    max_ttl="3h"

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
    max_ttl="3h"
fi

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
fi

if [ "$INITIALIZED" = "false" ]; then

  echo "Waiting for main postgres..."
  until pg_isready -h db -p 5432 -U "${ft_user}" 2>/dev/null; do  
    sleep 2
  done

  PGPASSWORD="${ft_password}" psql -h db -p 5432 -U "${ft_user}" -d "${ft_db}" <<SQL
  GRANT ALL ON SCHEMA public TO PUBLIC;
  ALTER DEFAULT PRIVILEGES FOR ROLE ${ft_user} IN SCHEMA public
    GRANT ALL ON TABLES TO PUBLIC;
  ALTER DEFAULT PRIVILEGES FOR ROLE ${ft_user} IN SCHEMA public
    GRANT ALL ON SEQUENCES TO PUBLIC;
SQL

  echo "Waiting for game postgres..."
  until pg_isready -h chat_db -p 5432 -U "${DB_USER}" 2>/dev/null; do
    sleep 2
  done

  PGPASSWORD="${DB_PASSWORD}" psql -h chat_db -p 5432 -U "${DB_USER}" -d "${DB_NAME}" <<SQL
  GRANT ALL ON SCHEMA public TO PUBLIC;
  ALTER DEFAULT PRIVILEGES FOR ROLE ${DB_USER} IN SCHEMA public
    GRANT ALL ON TABLES TO PUBLIC;
  ALTER DEFAULT PRIVILEGES FOR ROLE ${DB_USER} IN SCHEMA public
    GRANT ALL ON SEQUENCES TO PUBLIC;
SQL

fi

echo "✅ Vault setup complete"