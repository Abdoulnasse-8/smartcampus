# smartcampus:1.0 — image Docker de l'API SmartCampus (Node.js/Express)
# Alimentée par smartcampus-build.tar.gz : l'artefact archivé par Jenkins (TP3).
#
# Build :  docker build -t smartcampus:1.0 .
# Run :    docker run -d -p 8080:8080 -v smartcampus-data:/data --name smartcampus smartcampus:1.0

# --- Étape 1 : récupérer l'artefact produit par Jenkins ---
FROM debian:bookworm-slim AS artifact
WORKDIR /artifact
COPY smartcampus-build.tar.gz ./
RUN tar -xzf smartcampus-build.tar.gz && rm smartcampus-build.tar.gz

# --- Étape 2 : installer UNIQUEMENT les dépendances de production ---
FROM node:22-slim AS deps
ENV NODE_ENV=production
WORKDIR /app
COPY --from=artifact /artifact/backend/package.json /artifact/backend/package-lock.json ./
RUN npm ci --omit=dev

# --- Étape 3 : image finale (sans source inutile, sans outils de build) ---
FROM node:22-slim
ENV NODE_ENV=production \
    PORT=8080 \
    DB_PATH=/data/smartcampus.db
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=artifact /artifact/backend/package.json ./
COPY --from=artifact /artifact/backend/src ./src

RUN mkdir -p /data && chown -R node:node /app /data
USER node

# Données persistantes (fichier SQLite) hors du cycle de vie du conteneur
VOLUME ["/data"]
EXPOSE 8080

# Santé de l'application : GET /api/health doit répondre 200
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:8080/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["node", "src/server.js"]
