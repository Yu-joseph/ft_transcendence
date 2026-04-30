#!/bin/sh

vault server -config=/vault/config/vault-config.hcl &
VAULT_PID=$!

sleep 5            

/unseal.sh

wait $VAULT_PID