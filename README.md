# Prestataire de Service Mécanicien

Plateforme de mise en relation entre clients et mécaniciens prestataires de services.

## Stack technique

- **Backend** : Django 5.1 + Django REST Framework + JWT
- **Frontend** : React 19 + TypeScript + Vite
- **Base de données** : PostgreSQL 16

## Démarrage rapide

### 1. Base de données PostgreSQL

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

API disponible sur : http://localhost:8000/api/v1/

### 3. Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Application disponible sur : http://localhost:5173

## Déploiement production (gratuit)

- **Base de données** : [Neon](https://neon.tech) (PostgreSQL)
- **Backend** : [Render](https://render.com)
- **Frontend** : [Vercel](https://vercel.com)

Guide complet : [DEPLOYMENT.md](./DEPLOYMENT.md)

Fichiers de configuration inclus : `render.yaml`, `backend/build.sh`, `frontend/vercel.json`.

## Endpoints API (phase 1)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/health/health/` | Health check |
| POST | `/api/v1/auth/register/` | Inscription |
| POST | `/api/v1/auth/token/` | Connexion (JWT) |
| POST | `/api/v1/auth/token/refresh/` | Rafraîchir le token |
| GET | `/api/v1/auth/me/` | Profil utilisateur connecté |