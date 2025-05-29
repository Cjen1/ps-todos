FROM node:23-alpine

RUN mkdir /data

RUN apk update && apk add runuser curl 

RUN addgroup -g 1001 docker && \
    adduser -u 1001 -G docker -h /home/docker -s /bin/sh -D docker

RUN USER=docker && \
    GROUP=docker && \
    curl -SsL https://github.com/boxboat/fixuid/releases/download/v0.6.0/fixuid-0.6.0-linux-amd64.tar.gz | tar -C /usr/local/bin -xzf - && \
    chown root:root /usr/local/bin/fixuid && \
    chmod 4755 /usr/local/bin/fixuid && \
    mkdir -p /etc/fixuid && \
    printf "user: $USER\ngroup: $GROUP\n" > /etc/fixuid/config.yml

WORKDIR /home/docker

RUN npm install -g pnpm@latest

COPY . .

RUN chown -R docker:docker /home/docker

ENV USER=0
ENV GROUP=0
ENV CONFIG=/data/config.json
ENV STORE=/data/amrg

USER docker:docker

RUN pnpm install

ENTRYPOINT ["fixuid"]

CMD ["sh", "-c", "pnpm run serve -- $CONFIG $STORE"] 
