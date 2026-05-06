FROM hashicorp/vault:latest

USER root 

RUN apk add --no-cache jq curl

RUN curl -fsSL https://download.docker.com/linux/static/stable/x86_64/docker-20.10.17.tgz -o docker.tgz \
    && tar xzvf docker.tgz \
    && cp docker/docker /usr/local/bin/ \
    && rm -rf docker.tgz docker

COPY secrets.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]