# Architecture Système & Patterns

## Architecture Globale (Découplée)
Le projet suit une architecture **découplée moderne (Front statique + Back API REST)** :

- **Front-end (Client Web)** : Hébergé sur **GitHub Pages** (`index.html`, `styles.css`, modules dans `js/`). Aucun compte Google requis pour les joueurs.
- **Back-end (API Google Apps Script)** : `Code.gs` (routeur API REST `doPost`/`doGet`), `Controllers.gs` (logique métier & transactions `LockService`), `Database.gs` (ORM léger Google Sheets avec auto-migration), `Utils.gs` (helpers, dates & WhatsApp).
- **Base de données** : Classeur Google Sheets lié (Container-Bound Script).
- **Communication** : Requêtes HTTP `fetch()` REST en POST envoyées par `js/api.js` avec payload JSON et `Content-Type: text/plain;charset=utf-8` pour éviter les prévols CORS.

---

## Synchronisation Automatique Google Apps Script via Clasp (MANDATORY)

Pour éliminer définitivement les copier-coller manuels dans l'éditeur Google Sheets, le projet est configuré avec **Google Clasp** :

- **Configuration locale** :
  - `.clasp.json` : pointe vers le script ID `1yyBMcI-Hznjg-V8FL3hp_EtZgCJNfNH06cvhUz5WSkL6pSyB3F5s4Yly`.
  - `.claspignore` : isole et ignore tout le projet web/git/docs pour ne synchroniser que les 5 fichiers backend :
    - `appsscript.json`
    - `Code.gs`
    - `Controllers.gs`
    - `Database.gs`
    - `Utils.gs`
  - `.gitignore` : protège strictement `.clasp.json` et `.clasprc.json` contre tout commit Git.

- **RÈGLE SYSTÉMATIQUE DE SYNCHRONISATION (AGENT & DEV)** :
  > **Chaque fois qu'un fichier `.gs` ou le manifest `appsscript.json` est modifié ou proposé, l'agent ou le développeur doit SYSTÉMATIQUEMENT exécuter :**
  > `npx @google/clasp push`
  > afin de pousser immédiatement les modifications sur Google Apps Script sans intervention manuelle.

---

## Design Patterns Clés

### 1. Gestion d'État (Client)
- **Concept** : Objet global unique `AppState` (`js/state.js`) contenant route, matchId, adminToken, currentUser, currentMatchData, adminMatches.
- **Règle** : L'identité joueur est persistée dans `localStorage` (`covoid_username`). Pas de mutation directe du DOM sans passer par les modules de rendu (`js/ui-*.js`).

### 2. Communication Réseau & Robustesse
- **Concept** : `fetchApi(action, args)` dans `js/api.js` gère le cycle de vie réseau :
  - Déduplication de requêtes en vol (`inFlightRequests`) contre le double-clic intempestif.
  - Indicateur de chargement global (`#global-network-loader`).
  - Gestion unifiée des erreurs avec toasts.

### 3. Modèle de Données (Domaine)
- **Match** : `id`, `title`, `event_date`, `departure_time`, `meeting_place`, `is_locked`, `created_at`.
- **Ride (véhicule)** : `id`, `match_id`, `driver_name`, `is_direct`, `offers_outward`, `offers_return`, `seats_outward`, `seats_return`, `seats_total`, `outward_passengers[]`, `return_passengers[]`.
- **Waiting (liste d'attente)** : `id`, `match_id`, `player_name`, `needs_outward`, `needs_return`, `created_at`.
- **Règle Aller/Retour** : Les trajets Aller et Retour sont indépendants.
- **Règle "Je cherche"** : Un passager ne peut monter dans une voiture (`ctrlJoinRide`) que s'il est inscrit en demande (`waiting_list`) pour ce sens.

### 4. Sécurité Admin
- Les actions d'administration (`ctrlCreateMatch`, `ctrlDeleteMatch`, `ctrlToggleMatchLock`, `ctrlGetAdminMatches`, `ctrlGetWhatsAppSummary`) exigent un `adminToken` validé côté serveur via `LockService`.
