FROM hashicorp/vault:latest
USER root
RUN apk add --no-cache jq curl postgresql-client 
COPY entrypoint.sh /entrypoint.sh
COPY unseal.sh /unseal.sh
RUN chmod +x /entrypoint.sh /unseal.sh
ENTRYPOINT ["/entrypoint.sh"]