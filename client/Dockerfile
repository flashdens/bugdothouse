# Użyj domyślnego obrazu Node.js 20
FROM node:20-slim

# Stwórz katalog projektu
RUN mkdir -p "/bugdothouse/client"
WORKDIR /bugdothouse/client

# Skopiuj package.json (zależności projektu) do folderu aplikacji
COPY package.json .

# Ustaw zmienne środowiskowe
ENV WATCHPACK_POLLING true
ENV NEXT_TELEMETRY_DISABLED 1

# Zainstaluj zależności projektu
RUN npm install

# Uruchom aplikację
CMD ["npm", "run", "dev"]
