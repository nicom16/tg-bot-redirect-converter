FROM node:18-alpine

RUN apk add --no-cache ffmpeg 
RUN apk add --no-cache imagemagick 
RUN apk add --no-cache file

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]
