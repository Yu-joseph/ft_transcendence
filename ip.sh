#!/bin/bash

LOCAL_IP=$(hostname -I | awk '{print $1}')

cat > ./docker/.env.local <<EOF
VITE_CHAT_API=https://${LOCAL_IP}:8443/api
CORE=https://${LOCAL_IP}:8443
FORTY_TWO_REDIRECT_URI=http://${LOCAL_IP}:8080/authent/42/callback/
EOF
