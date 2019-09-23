FROM node:8-alpine 
RUN apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers autoconf automake make nasm python git && \
  npm install --quiet node-gyp -g
RUN apk add  --no-cache ffmpeg
WORKDIR /discord-bot
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["node", "./discord-client/index.js"]