FROM node:18.13.0-alpine3.17

WORKDIR /opt/app/

ADD . /opt/app/

RUN set -eax \
    && npm install

ENTRYPOINT ["node", "index.js"]