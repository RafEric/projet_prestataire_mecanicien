# Déploiement gratuit — Neon + Render + Vercel

Guide pour héberger l'application en production :

| Composant | Service | Plan gratuit |
|-----------|---------|--------------|
| Base de données | [Neon](https://neon.tech) | PostgreSQL gratuit |
| Backend (Django + WebSockets) | [Render](https://render.com) | Web Service gratuit |
| Frontend (React/Vite) | [Vercel](https://vercel.com) | Hobby gratuit |

---

## Prérequis

- Compte GitHub avec le code poussé sur un dépôt
- Comptes gratuits Neon, Render et Vercel

---

## 1. Base de données Neon

1. Créez un projet sur [console.neon.tech](https://console.neon.tech)
2. Nom suggéré : `prestataire-mecanicien`
3. Région : choisissez la plus proche de vos utilisateurs (ex. `eu-central-1`)
4. Dans **Dashboard → Connection Details**, copiez la **connection string pooled** :
   ```
   postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
5. Conservez cette URL — c'est votre `DATABASE_URL`

> Utilisez toujours l'URL **pooler** (`-pooler` dans le hostname) pour Render.

---

## 2. Backend sur Render

### Option A — Blueprint (recommandé)

1. [dashboard.render.com](https://dashboard.render.com) → **New → Blueprint**
2. Connectez votre dépôt GitHub
3. Render détecte `render.yaml` à la racine
4. Renseignez les variables marquées `sync: false` :

| Variable | Exemple | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://...@ep-xxx-pooler...?sslmode=require` | URL Neon (pooler) |
| `ALLOWED_HOSTS` | `prestataire-mecanicien-api.onrender.com` | Hostname Render (sans `https://`) |
| `CORS_ALLOWED_ORIGINS` | `https://votre-app.vercel.app` | URL Vercel du frontend |
| `CSRF_TRUSTED_ORIGINS` | `https://votre-app.vercel.app` | Même URL Vercel |
| `FRONTEND_URL` | `https://votre-app.vercel.app` | Lien dans les e-mails |

`SECRET_KEY` est généré automatiquement par Render.

5. Cliquez **Apply** — le build exécute migrations + collectstatic automatiquement.

### Option B — Manuel

1. **New → Web Service** → connectez le dépôt
2. Paramètres :
   - **Root Directory** : `backend`
   - **Runtime** : Python 3
   - **Build Command** : `chmod +x build.sh && ./build.sh`
   - **Start Command** : `daphne -b 0.0.0.0 -p $PORT config.asgi:application`
   - **Health Check Path** : `/api/v1/health/`
3. Variables d'environnement (voir tableau ci-dessus + `DEBUG=False`, `DJANGO_ENV=production`)

### Vérifier le backend

```text
GET https://VOTRE-APP.onrender.com/api/v1/health/
→ {"status":"ok","message":"Prestataire de Service Mécanicien API"}
```

### Données initiales (optionnel)

Dans le shell Render (**Shell** de votre service) :

```bash
python manage.py seed_madagascar_mechanics
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
User.objects.create_superuser(
    email='admin@prestataire-mg.fr',
    username='admin',
    password='VotreMotDePasseSecurise!',
    first_name='Admin',
    last_name='System',
    role='admin',
)
"
```

---

## 3. Frontend sur Vercel

1. [vercel.com/new](https://vercel.com/new) → importez le dépôt GitHub
2. Paramètres du projet :
   - **Framework Preset** : Vite
   - **Root Directory** : `frontend`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
3. Variables d'environnement (**Settings → Environment Variables**) :

| Variable | Valeur |
|----------|--------|
| `VITE_API_BASE_URL` | `https://VOTRE-APP.onrender.com/api/v1` |
| `VITE_WS_BASE_URL` | `wss://VOTRE-APP.onrender.com` |

> Les variables `VITE_*` sont injectées au **build**. Redéployez après modification.

4. Déployez → notez l'URL Vercel (ex. `https://prestataire-mecanicien.vercel.app`)

### Finaliser CORS

Retournez sur Render et mettez à jour :

- `CORS_ALLOWED_ORIGINS` = votre URL Vercel
- `CSRF_TRUSTED_ORIGINS` = votre URL Vercel
- `FRONTEND_URL` = votre URL Vercel

`CORS_ALLOW_VERCEL_PREVIEWS=True` (déjà dans `render.yaml`) autorise les previews `*.vercel.app`.

---

## 4. Architecture déployée

```text
Utilisateur
    ↓
Vercel (frontend React)
    ↓ API REST + WebSocket
Render (Django + Daphne)
    ↓ DATABASE_URL
Neon (PostgreSQL)
```

---

## Limitations du plan gratuit

| Service | Limitation |
|---------|------------|
| **Render** | Le service s'endort après ~15 min d'inactivité (cold start ~30 s) |
| **Render** | Pas de Redis → WebSockets en mémoire (OK pour 1 instance) |
| **Neon** | Quota stockage / compute limité |
| **Vercel** | Bande passante limitée sur Hobby |

---

## Dépannage

### Erreur CORS
Vérifiez que `CORS_ALLOWED_ORIGINS` contient exactement l'URL Vercel (`https://`, sans slash final).

### `DisallowedHost`
Ajoutez le hostname Render dans `ALLOWED_HOSTS` (ex. `mon-api.onrender.com`).

### Base de données inaccessible
- Utilisez l'URL **pooler** Neon
- Vérifiez `?sslmode=require` dans `DATABASE_URL`

### WebSocket ne connecte pas
- `VITE_WS_BASE_URL` doit être `wss://` (pas `ws://`)
- Le service Render doit être réveillé (première requête peut être lente)

### Build Render échoue sur collectstatic
Relancez le déploiement. Si persistant, vérifiez les logs `build.sh`.

---

## Variables d'environnement — récapitulatif

### Render (backend)

```env
DJANGO_ENV=production
DEBUG=False
SECRET_KEY=<généré>
DATABASE_URL=<neon pooler url>
ALLOWED_HOSTS=mon-api.onrender.com
CORS_ALLOWED_ORIGINS=https://mon-app.vercel.app
CSRF_TRUSTED_ORIGINS=https://mon-app.vercel.app
FRONTEND_URL=https://mon-app.vercel.app
CORS_ALLOW_VERCEL_PREVIEWS=True
CHANNEL_LAYER_BACKEND=channels.layers.InMemoryChannelLayer
```

### Vercel (frontend)

```env
VITE_API_BASE_URL=https://mon-api.onrender.com/api/v1
VITE_WS_BASE_URL=wss://mon-api.onrender.com
```

### Neon

```env
DATABASE_URL=postgresql://...@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```