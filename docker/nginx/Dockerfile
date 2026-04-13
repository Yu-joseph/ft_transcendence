FROM nginx:1.29.7

RUN apt-get update && apt-get install -y \
    apt-utils \
    git \
    wget \
    build-essential \
    libpcre2-8-0 libpcre2-dev \
    zlib1g zlib1g-dev \
    libssl-dev \
    libgd-dev \
    libxml2 libxml2-dev \
    make \
    uuid-dev \
    autoconf \
    automake \
    libtool \
    pkg-config \
    libcurl4-openssl-dev \
    libyajl-dev \
    liblmdb-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt
RUN git clone --depth 1 -b v3/master --single-branch https://github.com/SpiderLabs/ModSecurity ModSecurity

WORKDIR /opt/ModSecurity
RUN git submodule init && \
    git submodule update && \
    ./build.sh && \
    ./configure && \
    make && \
    make install

WORKDIR /opt
RUN git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git

# ← Must match the installed nginx binary version exactly
RUN wget http://nginx.org/download/nginx-1.29.7.tar.gz && \
    tar -xzvf nginx-1.29.7.tar.gz

WORKDIR /opt/nginx-1.29.7

RUN NGINX_CONFIGURE_ARGS=$(nginx -V 2>&1 | grep "configure arguments:" | sed 's/configure arguments: //') \
    && eval ./configure "${NGINX_CONFIGURE_ARGS} --add-dynamic-module=../ModSecurity-nginx" \
    && make modules

RUN mkdir -p /usr/share/nginx/modules/ && \
    cp objs/ngx_http_modsecurity_module.so /usr/share/nginx/modules/

RUN mkdir -p /etc/nginx/modsec

COPY modsecurity.conf /etc/nginx/modsec/modsecurity.conf

WORKDIR /opt
RUN git clone https://github.com/coreruleset/coreruleset.git

WORKDIR /opt/coreruleset
RUN cp -r /opt/coreruleset/rules /etc/nginx/modsec/ 

COPY crs-setup.conf /etc/nginx/modsec/crs-setup.conf
COPY main.conf /etc/nginx/modsec/main.conf
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.conf /etc/nginx/conf.d/default.conf