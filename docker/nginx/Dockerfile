FROM owasp/modsecurity-crs:nginx-alpine
USER root

RUN rm -f /docker-entrypoint.d/*.sh

RUN mkdir -p /etc/nginx/certs && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/certs/nginx.key \
    -out /etc/nginx/certs/nginx.crt \
    -subj "/CN=localhost"

RUN mkdir -p /etc/nginx/modsec/rules && \
    cp /etc/modsecurity.d/owasp-crs/rules/* /etc/nginx/modsec/rules/

COPY main.conf          /etc/nginx/modsec/main.conf
COPY modsecurity.conf   /etc/nginx/modsec/modsecurity.conf
COPY crs-setup.conf     /etc/nginx/modsec/crs-setup.conf
COPY nginx.conf         /etc/nginx/nginx.conf
COPY conf.conf          /etc/nginx/conf.d/default.conf  