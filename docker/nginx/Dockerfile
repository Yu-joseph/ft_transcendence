FROM owasp/modsecurity-crs:nginx-alpine

USER root
RUN rm -f /docker-entrypoint.d/*.sh
RUN mkdir -p /etc/nginx/certs && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/certs/nginx.key \
    -out /etc/nginx/certs/nginx.crt \
    -subj "/CN=localhost"

COPY modsecurity.conf /etc/modsecurity.d/modsecurity.conf
COPY crs-setup.conf   /etc/modsecurity.d/owasp-crs/crs-setup.conf
COPY main.conf        /etc/modsecurity.d/main.conf
COPY nginx.conf       /etc/nginx/nginx.conf
COPY conf.conf        /etc/nginx/conf.d/default.conf