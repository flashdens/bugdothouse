FROM node:18-slim

RUN mkdir -p "/app/client"
WORKDIR /app/client

COPY . .

ENV WATCHPACK_POLLING true
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm install
CMD ["npm", "run", "dev"]
