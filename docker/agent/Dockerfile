FROM hashicorp/vault:latest

USER root 

RUN apk add --no-cache jq curl

COPY secrets.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]