# ⚽ Football Stats — Application Fullstack React + Symfony

Application web fullstack de gestion et statistiques de matchs de football, construite avec React (Vite) pour le frontend et Symfony 7 pour l'API REST.

---

## 📸 Aperçu

- **Frontend** : Interface moderne style application de paris sportifs
- **Backend** : API REST sécurisée avec JWT
- **Base de données** : MariaDB via Docker
- **Données** : Ligue des Champions UEFA 2024-2025 (45 matchs, 27 joueurs)

---

## 🏗️ Architecture

```
football-react-symfony/
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── pages/         # Accueil, Rencontres, Statistiques, Classement
│   │   ├── pages/admin/   # Dashboard, CRUD Rencontres, Joueurs, Users
│   │   ├── components/    # Navigation, Footer, PrivateRoute, AdminRoute
│   │   ├── context/       # AuthContext (JWT)
│   │   └── services/      # Api.jsx (Axios)
│   └── Dockerfile
├── backend/           # Symfony 7 API REST
│   ├── src/
│   │   ├── Entity/        # User, Rencontre, Joueur, Equipe
│   │   ├── Controller/    # Auth, Rencontre, Joueur, Equipe, User
│   │   ├── Repository/    # Requêtes DQL avancées
│   │   ├── Service/       # StatsService (logique métier)
│   │   └── DataFixtures/  # Données UCL 2024-2025
│   └── Dockerfile
└── docker-compose.yml
```

---

## 🚀 Installation et lancement

### Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et lancé
- Git

### Étapes

```bash
# 1. Cloner le projet
git clone <url-du-repo>
cd football-react-symfony

# 2. Lancer les containers
docker compose up --build

# 3. (Premier lancement) Créer la base de données et appliquer les migrations
docker compose exec backend php bin/console doctrine:database:create
docker compose exec backend php bin/console doctrine:migrations:migrate
docker compose exec backend php bin/console doctrine:fixtures:load

# 4. Générer les clés JWT
docker compose exec backend php bin/console lexik:jwt:generate-keypair
```

### Accès

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:5173        |
| API       | http://localhost:8000        |
| Swagger   | http://localhost:8000/api/doc |
| Adminer   | http://localhost:8080        |

---

## 🔐 Comptes de test

| Email                | Mot de passe | Rôle        |
|----------------------|-------------|-------------|
| admin@football.fr    | password123  | ROLE_ADMIN  |
| user@football.fr     | password123  | ROLE_USER   |

---

## 🌍 Variables d'environnement

### Backend (`backend/.env`)

```env
APP_ENV=dev
DATABASE_URL="mysql://app:app@database:3306/app?serverVersion=10.11&charset=utf8mb4"
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=votre_passphrase_securisee
```

### Docker (`docker-compose.yml`)

```env
MARIADB_DATABASE=app
MARIADB_USER=app
MARIADB_PASSWORD=app
MARIADB_ROOT_PASSWORD=root
```

---

## 📡 API REST — Endpoints

### Authentification

| Méthode | Route                  | Accès    | Description        |
|---------|------------------------|----------|--------------------|
| POST    | /api/auth/inscription  | Public   | Créer un compte    |
| POST    | /api/auth/connexion    | Public   | Se connecter (JWT) |
| GET     | /api/auth/me           | JWT      | Profil connecté    |

### Rencontres

| Méthode | Route                              | Accès      | Description              |
|---------|------------------------------------|------------|--------------------------|
| GET     | /api/rencontres                    | JWT        | Liste paginée (?page&limit) |
| GET     | /api/rencontres/{id}               | JWT        | Détail d'un match        |
| GET     | /api/rencontres/saison/{saison}    | JWT        | Matchs par saison        |
| GET     | /api/rencontres/equipe/{equipe}    | JWT        | Matchs + forme équipe    |
| GET     | /api/rencontres/classement/{saison}| JWT        | Classement calculé       |
| GET     | /api/rencontres/stats              | JWT        | Statistiques globales    |
| POST    | /api/rencontres                    | ROLE_ADMIN | Créer un match           |
| PUT     | /api/rencontres/{id}               | ROLE_ADMIN | Modifier un match        |
| DELETE  | /api/rencontres/{id}               | ROLE_ADMIN | Supprimer un match       |

### Joueurs

| Méthode | Route                    | Accès      | Description       |
|---------|--------------------------|------------|-------------------|
| GET     | /api/joueurs             | JWT        | Liste des joueurs |
| GET     | /api/joueurs/buteurs     | JWT        | Top buteurs       |
| GET     | /api/joueurs/passeurs    | JWT        | Top passeurs      |
| GET     | /api/joueurs/equipe-type | JWT        | Équipe type       |
| GET     | /api/joueurs/{id}        | JWT        | Détail joueur     |
| POST    | /api/joueurs             | ROLE_ADMIN | Créer joueur      |
| PUT     | /api/joueurs/{id}        | ROLE_ADMIN | Modifier joueur   |
| DELETE  | /api/joueurs/{id}        | ROLE_ADMIN | Supprimer joueur  |

### Équipes

| Méthode | Route             | Accès      | Description          |
|---------|-------------------|------------|----------------------|
| GET     | /api/equipes      | JWT        | Liste + stats        |
| GET     | /api/equipes/{id} | JWT        | Détail équipe + stats|
| POST    | /api/equipes      | ROLE_ADMIN | Créer équipe         |
| PUT     | /api/equipes/{id} | ROLE_ADMIN | Modifier équipe      |
| DELETE  | /api/equipes/{id} | ROLE_ADMIN | Supprimer équipe     |

---

## 🗃️ Entités et relations

```
User          → Authentification JWT (ROLE_USER / ROLE_ADMIN)

Equipe        → Club de football
  └── joueurs          (OneToMany → Joueur)
  └── rencontresADomicile  (OneToMany → Rencontre)
  └── rencontresAExterieur (OneToMany → Rencontre)

Joueur        → Statistiques joueur
  └── equipe   (ManyToOne → Equipe)

Rencontre     → Match de football
  └── equipeObj1  (ManyToOne → Equipe, nullable)
  └── equipeObj2  (ManyToOne → Equipe, nullable)
```

---

## 🧠 Logique métier

- **Classement automatique** : calculé dynamiquement depuis les scores (V=3pts, N=1pt, D=0pt)
- **Forme récente** : 5 derniers résultats d'une équipe (V/N/D)
- **Statistiques globales** : total buts, moyenne buts/match, matchs spectaculaires (≥4 buts), clean sheets
- **Ratio buts/match** : calculé par joueur
- **Stats d'équipe** : points, différence de buts, classement calculés en temps réel

---

## 🔒 Sécurité

- Authentification JWT (LexikJWTAuthenticationBundle)
- Routes protégées par rôles (`ROLE_USER` / `ROLE_ADMIN`)
- Validation côté serveur (Symfony Validator) sur toutes les entités
- Validation côté client sur tous les formulaires React
- Protection CORS personnalisée
- Hashage des mots de passe (bcrypt)

---

## 💻 Fonctionnalités Frontend

### Espace utilisateur
- Inscription / Connexion / Déconnexion
- Liste des matchs avec filtres et recherche
- Détail d'un match
- Statistiques (buteurs, passeurs, équipe type)
- Classement par saison avec tableau de bord

### Espace admin (`/admin`)
- Dashboard avec statistiques globales
- CRUD complet sur les rencontres (+ aperçu live du score)
- CRUD complet sur les joueurs (+ filtres par poste)
- Gestion des utilisateurs (changement de rôle, suppression)

---

## 🛠️ Commandes utiles

```bash
# Voir les logs
docker compose logs -f backend

# Entrer dans le container backend
docker compose exec backend bash

# Créer une migration après modification d'entité
docker compose exec backend php bin/console make:migration
docker compose exec backend php bin/console doctrine:migrations:migrate

# Recharger les fixtures
docker compose exec backend php bin/console doctrine:fixtures:load --no-interaction

# Installer un package Composer
docker compose exec backend composer require <package>

# Installer un package npm
cd frontend && npm install <package>
```

---

## 🧱 Stack technique

| Couche    | Technologie                          |
|-----------|--------------------------------------|
| Frontend  | React 18, Vite, React Router, Axios  |
| Backend   | Symfony 7.4, PHP 8.3                 |
| ORM       | Doctrine ORM                         |
| Auth      | LexikJWT Authentication Bundle       |
| Doc API   | NelmioApiDocBundle (Swagger/OpenAPI) |
| BDD       | MariaDB 10.11                        |
| DevOps    | Docker, Docker Compose               |
| Styles    | CSS custom (Barlow Condensed)        |

---

## 📦 Installation des bundles Symfony

```bash
# JWT
composer require lexik/jwt-authentication-bundle

# Swagger/OpenAPI
composer require nelmio/api-doc-bundle zircote/swagger-php

# Fixtures (dev)
composer require --dev doctrine/doctrine-fixtures-bundle

# Validator
composer require symfony/validator
```
