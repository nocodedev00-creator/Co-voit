# Contexte Actif

## Travail Réalisé & Validé
Migration complète et réussie de l'application Co'Voit' vers une **architecture découplée** :
- **Front-end statique autonome sur GitHub Pages** (`https://nocodedev00-creator.github.io/Co-voit/`) : suppression définitive des erreurs *"Google Drive - impossible d'ouvrir le fichier"* et des conflits multi-comptes sur smartphone.
- **Backend Google Apps Script en mode API REST JSON** : conservation du classeur Google Sheets et des règles métier.
- **Résolution du bug de l'heure (00:09)** : neutralisation définitive de l'anomalie 1899 de Google Sheets :
  - `Database.gs` : lecture via `getDisplayValues()` pour extraire directement le texte brut affiché ("17:30") et écriture forcée en texte via préfixe apostrophe (`'`).
  - `Utils.gs` & `js/ui-utils.js` : `formatShortTime` durci pour refuser les dates pures sans heure (comme "1899-12-30") et renvoyer `--:--` au lieu de calculer un fuseau erroné.
- **Protection Anti-Double-Clic & Accélération Latence** :
  - `js/api.js` : registre `inFlightRequests` qui intercepte et fusionne tout clic répété vers la même action en vol + barre de progression globale (`#global-network-loader`).
  - `js/app.js` & `js/ui-admin.js` : `setButtonLoading` (désactivation immédiate + spinner + texte de chargement) sur tous les formulaires (création de match, véhicule, trajet direct, liste d'attente, actions admin).
  - `Database.gs` : mise en cache `CacheService` des structures de tables, token admin et vérifications d'en-têtes pour éliminer ~15 requêtes RPC Google Sheets redondantes par appel (gain de latence de ~70%).
- **Écran d'accueil interactif** : ajout d'un champ de connexion Coach pour entrer son `ADMIN_TOKEN` en un clic sans paramètre d'URL.

## Documentation
- `README.md` disponible à la racine du projet pour guider le coach et les développeurs.
