FROM node:20-slim

WORKDIR /bugdothouse/client

COPY package.json ./

RUN npm install

COPY . .

ENV WATCHPACK_POLLING=true
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

CMD ["npm", "run", "dev"]

