FROM node:trixie

WORKDIR /app

RUN npm i -g serve

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["serve", "-s", "dist"]
