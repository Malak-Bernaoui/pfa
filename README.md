#  Plateforme de gestion scolaire – Documentation projet

Bienvenue dans la documentation de notre plateforme de gestion scolaire moderne. Ce projet est composé d’un **frontend React** et d’un **backend Laravel**. Il propose une authentification sécurisée, une détection automatique des rôles (sans champ `role` dans la table `users`) et des interfaces dédiées pour chaque type d’utilisateur : étudiant, enseignant, administrateur.

---

##  Fonctionnalités principales

###  Authentification

- **Inscription** (`/register`)  
  Formulaire classique (nom, email, mot de passe). Un utilisateur est créé dans `users` **sans aucun rôle**.
- **Connexion** (`/login`)  
  Authentification via email + mot de passe. Le serveur génère un token **Sanctum**.
- **Détection automatique du type** (sans colonne `role`)  
  Le backend vérifie l’existence d’une entrée dans les tables :
  - `administrateurs` → rôle = `admin`
  - `enseignants` → rôle = `enseignant`
  - `etudiants` → rôle = `etudiant`
  - Sinon → utilisateur par défaut.
- **Redirection intelligente**  
  Chaque utilisateur est redirigé vers son espace spécifique après connexion.

---

##  Interfaces utilisateur

###  Page d’accueil (`/accueil`)

Accessible aux utilisateurs sans rôle spécifique. Elle contient :

- Bannière de bienvenue personnalisée.
- Présentation de l’établissement (historique, effectifs, taux de réussite, nombre d’enseignants).
- Widgets d’accès rapide (emploi du temps, liste des groupes, reglement interieur , contact).
- Mode sombre / clair (persistant via `localStorage`).

### Espace étudiant (`/etudiant/:id`)

- **Mon profil** : nom, prénom, date de naissance, classe, email.
- **Mes notes** : tableau des notes par matière, calcul de la moyenne générale.
- **Mes absences** : liste des absences (date, matière, nombre d’heures, justification).
- **Attestation scolaire** : génération d’un PDF officiel avec les informations personnelles, classe, remarque administrative.
- **Changement de mot de passe** (modal sécurisé).
- **Export PDF** : génère un relevé complet (infos personnelles, notes, absences) avec un design professionnel (Tailwind + impression).
- **Mode sombre** intégré.

### Espace enseignant (`/enseignant/:id`)

- **Mon profil** : nom, prénom, matière enseignée, email, nombre de classes affectées.
- **Tableau de bord** : vue d’ensemble des classes, étudiants, notes saisies et absences enregistrées.
- **Mes classes** : liste des classes auxquelles l’enseignant est associé. Un clic sur une classe affiche la liste des étudiants (avec possibilité d’ajouter directement une note ou une absence).
- **Gestion des notes** :
  - Sélection d’une classe → affichage de ses étudiants.
  - Clic sur un étudiant pour voir ses notes (matière de l’enseignant).
  - Ajout / modification / suppression d’une note (modal dédié).
- **Gestion des absences** :
  - Sélection d’une classe → affichage de ses étudiants.
  - Clic sur un étudiant pour voir ses absences (date, nombre d’heures, justification).
  - Ajout / modification / suppression d’une absence (sans justification possible depuis le formulaire).
- **Emploi du temps** : tableau hebdomadaire des cours (statique, personnalisable).
- **Mode sombre** intégré.
- **Déconnexion** via le menu utilisateur.



##  Architecture technique

###  Backend (Laravel 12)

- **Authentification** : Laravel Sanctum (tokens).
- **Base de données** : MySQL / MariaDB.
- **Tables principales** :
  - `users` (id, name, email, password) – **pas de colonne `role`**.
  - `administrateurs` (user_id)
  - `enseignants` (user_id, nom, matiere)
  - `etudiants` (user_id, nom, prenom, dateNaissance, classe_id)
  - `notes` (etudiant_id, matiere, note)
  - `absences` (etudiant_id, date, enseignant_id, nb_heures, justifiee)
  - `classes` (nom) – relation avec les étudiants.
  - `contact`(nom , email, sujet, message)
- **CORS** : configuré pour autoriser `http://localhost:3000`.

###  Frontend (React 18 + Tailwind CSS)

- **Routes** : react-router-dom (pages Login, Register, Espaces utilisateurs, Accueil).
- **Gestion d’état** : hooks React (`useState`, `useEffect`).
- **Appels API** : Axios avec intercepteur pour ajouter le token `Bearer`.
- **Icônes** : Lucide React.
- **Mode sombre** : bascule avec classe `dark` sur `<html>`, stockée dans `localStorage`.

###  Sécurité

- Toutes les routes API (`/api/*`) sont protégées par `auth:sanctum`.
- Le frontend stocke le token dans `localStorage` et l’envoie dans l’entête `Authorization`.
- Les mots de passe sont hachés (`bcrypt`).

---

## Installation rapide (environnement de développement)

### Backend

```bash
cd Backend
composer install
cp .env.example .env
php artisan key:generate
# Configurer la base de données dans .env
php artisan migrate --seed
php artisan serve
```

### Frontend
```bash
cd Frontend
npm install
npm run dev

```