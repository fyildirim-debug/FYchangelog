# GitHub Changelog - Docker Image
FROM node:20-alpine

# Calisma dizini
WORKDIR /app

# Package dosyalarini kopyala
COPY package*.json ./

# Bagimliliklari yukle
RUN npm ci --only=production

# Uygulama dosyalarini kopyala
COPY . .

# Port
EXPOSE 3001

# Ortam degiskenleri
ENV NODE_ENV=production
ENV PORT=3001

# Environment Variables Defaults
ENV SHOW_PRIVATE_REPOS=true
ENV SHOW_API_BUTTON=true
ENV DEFAULT_LANG=TR

# Uygulamayi baslat
CMD ["node", "server.js"]
