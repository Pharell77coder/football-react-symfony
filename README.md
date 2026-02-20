# ⚽ Football React Symfony

Stack : **React Vite** (frontend) · **Symfony 7.4** (API backend) · **MariaDB** · **Docker**

---

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) lancé et en cours d'exécution
- [Node.js](https://nodejs.org/) 20+
- [Composer](https://getcomposer.org/) 2+
- [PHP](https://www.php.net/) 8.3+

---

## Installation

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd football-react-symfony
```

### 2. Créer le projet React Vite

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
cd ..
```

### 3. Créer le projet Symfony

```bash
composer create-project symfony/skeleton backend
cd backend
composer require symfony/orm-pack symfony/serializer-pack
composer require --dev symfony/maker-bundle
cd ..
```

### 4. Configurer le CORS (sans bundle)

Créer le fichier `backend/src/EventListener/CorsListener.php` :

```php
<?php

namespace App\EventListener;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;

class CorsListener
{
    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();
        if ($request->getMethod() === 'OPTIONS') {
            $response = new Response();
            $response->headers->set('Access-Control-Allow-Origin', 'http://localhost:5173');
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            $response->setStatusCode(204);
            $event->setResponse($response);
        }
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        $event->getResponse()->headers->set('Access-Control-Allow-Origin', 'http://localhost:5173');
        $event->getResponse()->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $event->getResponse()->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
}
```

Mettre à jour `backend/config/services.yaml` :

```yaml
parameters:

services:
    _defaults:
        autowire: true
        autoconfigure: true

    App\:
        resource: '../src/'

    App\EventListener\CorsListener:
        tags:
            - { name: kernel.event_listener, event: kernel.request, method: onKernelRequest, priority: 250 }
            - { name: kernel.event_listener, event: kernel.response, method: onKernelResponse }
```

### 5. Configurer la base de données

Modifier `backend/.env` :

```env
DATABASE_URL="mysql://app:app@database:3306/app?serverVersion=10.11&charset=utf8mb4"
```

### 6. Configurer le proxy Vite

Modifier `frontend/vite.config.ts` :

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
      }
    }
  }
})
```

---

## Lancer le projet

```bash
docker compose up --build
```

### Initialiser la base de données (première fois)

Dans un second terminal :

```bash
docker compose exec backend php bin/console doctrine:database:create
docker compose exec backend php bin/console doctrine:migrations:migrate
```

---

## URLs

| Service   | URL                      |
|-----------|--------------------------|
| Frontend  | http://localhost:5173    |
| Backend   | http://localhost:8000    |
| Adminer   | http://localhost:8080    |
| MariaDB   | localhost:3306           |

---

## Structure du projet

```
football-react-symfony/
├── docker-compose.yml
├── frontend/                  # React Vite (TypeScript)
│   ├── Dockerfile
│   ├── vite.config.ts
│   ├── src/
│   └── ...
└── backend/                   # Symfony 7.4 (API)
    ├── Dockerfile
    ├── src/
    │   ├── Controller/
    │   └── EventListener/
    │       └── CorsListener.php
    ├── config/
    │   ├── packages/
    │   └── services.yaml
    └── ...
```

---

## Commandes utiles

```bash
# Voir les logs
docker compose logs -f

# Accéder au shell du backend
docker compose exec backend sh

# Créer une entité Symfony
docker compose exec backend php bin/console make:entity

# Créer une migration
docker compose exec backend php bin/console make:migration

# Appliquer les migrations
docker compose exec backend php bin/console doctrine:migrations:migrate

# Arrêter les containers
docker compose down

# Arrêter et supprimer les volumes (reset DB)
docker compose down -v
```

---

## Problèmes courants

**`service "backend" is not running`**
→ Lancer d'abord `docker compose up --build` et vérifier les logs avec `docker compose logs backend`.

**`SSL certificate problem` avec Composer**
→ Avast (ou autre antivirus) bloque les connexions HTTPS. Désactiver temporairement le "Web Shield" le temps d'installer les dépendances.

**Docker ne démarre pas**
→ S'assurer que Docker Desktop est lancé (icône verte dans la barre des tâches Windows).
