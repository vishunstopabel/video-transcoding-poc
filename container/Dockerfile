FROM node:18-alpine


RUN apk update && apk upgrade && apk add --no-cache ffmpeg


WORKDIR /app


COPY package.json package-lock.json ./
RUN npm install


COPY index.js .

CMD ["npm", "start"]
