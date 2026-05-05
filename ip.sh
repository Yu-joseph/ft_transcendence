#!/usr/bin/env bash
set -euo pipefail

get_local_ip() {
  local ipaddr
    ipaddr=$(ipconfig getifaddr en0)
  printf '%s' "$ipaddr"
}

LOCAL_IP=$(get_local_ip)

cat > ./docker/.env.local <<EOF
VITE_CHAT_API=https://${LOCAL_IP}:8443/api
CORS_ORIGIN=["http://localhost:8080", "https://${LOCAL_IP}:8443"]
FORTY_TWO_REDIRECT_URI=http://${LOCAL_IP}:8080/authent/42/callback/
EOF
