FROM hashicorp/vault:latest

USER root 

RUN apk add --no-cache jq curl docker-cli

COPY reload_br.sh /reload_br.sh

COPY reload.sh /reload.sh

COPY secrets.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh
RUN chmod +x /reload.sh
RUN chmod +x /reload_br.sh
ENTRYPOINT ["/entrypoint.sh"]