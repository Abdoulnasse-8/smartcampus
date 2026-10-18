# SmartCampus

Plateforme universitaire de réservation de salles — MVP.

- `backend/` : API REST **Node.js / Express / SQLite** (JWT)
- `frontend/` : application **Next.js (App Router) + Tailwind CSS**

## Architecture

```
smartcampus/
├── backend/
│   ├── src/
│   │   ├── app.js              # Application Express (routes + health)
│   │   ├── server.js           # Point d'entrée (init DB + listen)
│   │   ├── config.js           # Config via variables d'environnement
│   │   ├── db.js               # SQLite + schéma + seed
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

## Déclenchement automatique

Le job Jenkins `smartcampus-pipeline` est configuré avec un trigger **Poll SCM**
(`* * * * *`) : Jenkins interroge le dépôt toutes les minutes et lance le
pipeline dès qu'un nouveau commit apparaît sur `main`.
