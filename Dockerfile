# Dockerfile für HPVG Quiz-App
FROM node:18-alpine

# Metadata
LABEL maintainer="your-email@example.com"
LABEL description="HPVG Quiz App für Messestände"

# Arbeitsverzeichnis erstellen
WORKDIR /app

# Dependencies kopieren und installieren
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# App-Code kopieren
COPY . .

# Non-root User erstellen
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Zu non-root User wechseln
USER nodejs

# Port exponieren
EXPOSE 3000

# Health-Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# App starten
CMD ["node", "server-production.js"]
