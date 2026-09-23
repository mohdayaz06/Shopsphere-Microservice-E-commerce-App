FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY scripts ./scripts

RUN npm install

COPY src ./src

EXPOSE 8080

CMD ["npx", "http-server", "src", "-p", "8080", "-c-1"]
