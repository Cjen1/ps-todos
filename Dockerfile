FROM node:slim

RUN mkdir /data

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

COPY ./server/config.json /data/config.json

ENV CONFIG=/data/config.json
ENV STORE=/data/db.sqlite

CMD ["sh", "-c", "npm run serve -- $CONFIG $STORE"] 
