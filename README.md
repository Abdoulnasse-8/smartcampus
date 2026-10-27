# SmartCampus

Plateforme universitaire de réservation de salles — MVP.

- `backend/` : API REST **Node.js / Express / SQLite ou PostgreSQL** (JWT)
- `frontend/` : application **Next.js (App Router) + Tailwind CSS**

## Architecture

```
smartcampus/
├── backend/
│   ├── src/
│   │   ├── app.js              # Application Express (routes + health)
│   │   ├── server.js           # Point d'entrée (init DB + listen)
│   │   ├── config.js           # Config via variables d'environnement
│   │   ├── db.js               # Double driver SQLite / PostgreSQL + schéma + seed
│   │   ├── middleware/auth.js  # Vérification du JWT (Bearer)
│   │   ├── routes/             # auth.js, rooms.js, bookings.js
│   │   └── services/           # authService.js (login + JWT)
│   ├── tests/auth.test.js      # Tests Jest (login) + simulation d'échec CI
│   └── .env.example
├── frontend/
│   ├── app/                    # /login, /dashboard, /rooms (App Router)
│   ├── components/             # Navbar, RoomCard, BookingForm
│   ├── lib/                    # api.ts (Axios + JWT), types.ts
│   ├── middleware.ts           # Protection des routes (cookie token)
│   └── next.config.mjs         # Rewrites /api -> backend
├── Dockerfile                  # Image de l'API (multi-stage, non-root)
├── .dockerignore
├── compose.yaml                # API + PostgreSQL + volumes + healthchecks
└── Jenkinsfile                 # Pipeline CI/CD
```

## API REST

| Méthode | Route             | Auth | Description                          |
| ------- | ----------------- | ---- | ------------------------------------ |
| GET     | `/api/health`     | Non  | État du service                      |
| POST    | `/api/auth/login` | Non  | Connexion, renvoie un JWT            |
| GET     | `/api/rooms`      | Oui  | Liste des salles                     |
| GET     | `/api/bookings`   | Oui  | Réservations de l'utilisateur        |
| POST    | `/api/bookings`   | Oui  | Réserve une salle (détection conflit)|

## Démarrage

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm start        # http://localhost:8080
npm test         # suite Jest
```

### Frontend

```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
```

Le frontend proxie `/api/*` vers `http://localhost:8080` (modifiable via `API_URL`).

### Comptes de démo (seed)

| Email                      | Mot de passe  | Rôle    |
| -------------------------- | ------------- | ------- |
| `admin@smartcampus.com`    | `password123` | admin   |
| `etudiant@smartcampus.com` | `password123` | student |

## Tests & CI

```bash
cd backend && npm test
```

- Tests unitaires et d'intégration du login dans `backend/tests/auth.test.js`.
- **Simulation d'échec CI** : la ligne marquée `[CI-FAIL]` permet de faire échouer
  volontairement le pipeline (ex. `expect(res.status).toBe(500)`).
- Le `Jenkinsfile` enchaîne : installation, tests backend, build frontend, puis
  archivage des artefacts.

## Docker

L'image est construite à partir de l'artefact CI `smartcampus-build.tar.gz` (produit
par Jenkins) et peut tourner seule (SQLite) ou avec PostgreSQL via Compose.

```bash
# 1) Artefact (même commande que le Jenkinsfile)
tar --exclude=node_modules -czf smartcampus-build.tar.gz backend frontend

# 2) Image
docker build -t smartcampus:1.0 .

# 3a) Conteneur seul — SQLite persistée dans un volume
docker run -d --name smartcampus -p 8080:8080 -v smartcampus-data:/data smartcampus:1.0

# 3b) Ou pile complète — API + PostgreSQL
docker compose up -d
docker compose ps
docker compose logs -f api
```

Le driver de base est choisi par variables d'environnement : `DB_DRIVER=sqlite`
(défaut) ou `DB_DRIVER=postgres` + `DATABASE_URL` (voir `backend/.env.example`).
Dans Compose, l'API joint PostgreSQL par le **nom du service** (`postgres`).

## Déclenchement automatique

Le job Jenkins `smartcampus-pipeline` est configuré avec un trigger **Poll SCM**
(`* * * * *`) : Jenkins interroge le dépôt toutes les minutes et lance le
pipeline dès qu'un nouveau commit apparaît sur `main`.

Polling vérifié toutes les minutes (`* * * * *`).
