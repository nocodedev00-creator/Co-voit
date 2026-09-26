# Contexte Actif

## Travail Réalisé
Migration de l'application Co'Voit' d'une Web App monolithique Google Apps Script vers une **architecture découplée** :
- **Front-end statique autonome sur GitHub Pages** : supprime définitivement les erreurs *"Google Drive - impossible d'ouvrir le fichier"* et les conflits de sessions multi-comptes sur smartphone.
- **Backend Google Apps Script en mode API REST** : conserve votre classeur Google Sheets, vos données existantes et les 13 fonctions métier de `Controllers.gs`.

## Détail des Changements Appliqués
1. **`.gitignore`** : créé et configuré (fichiers OS, IDE, logs, secrets).
2. **`Code.gs`** : converti en routeur API JSON HTTP `doPost(e)` / `doGet(e)` avec `ContentService`.
3. **`styles.css`** : extrait de `Styles.html` pour un chargement direct standard.
4. **`js/`** : code client réorganisé en modules stricts (< 300 lignes chacun) :
   - `config.js` : configuration de l'URL Web App Google Apps Script.
   - `state.js` : état global et routage autonome d'URL via `window.location.search`.
   - `api.js` : fonction `callServer` utilisant `fetch()` POST en `text/plain` (contourne les soucis de prévol CORS).
   - `ui-utils.js` : helpers graphiques, toasts, modales, identité locale.
   - `ui-match-summary.js` : calculs de solde de places et modale de synthèse A/R.
   - `ui-match-cards.js` : construction des cartes véhicules (2 colonnes) et des pastilles passagers.
   - `ui-match-render.js` : orchestration de la vue match et statut joueur.
   - `ui-match-actions.js` : handlers de réservation, désistement et annulation.
   - `ui-admin.js` : tableau de bord coach et actions sur les rencontres.
   - `app.js` : point d'entrée `DOMContentLoaded` et liaisons d'événements.
5. **`index.html`** : page d'accueil autonome prête pour GitHub Pages (renommée en minuscules dans Git).

## Action Immédiate Requise par l'Utilisateur
1. Copier le contenu de [Code.gs](file:///d:/OneDrive/Code/Co%20voit/Code.gs) dans l'éditeur Google Apps Script.
2. Déployer une **Nouvelle version** de l'Application Web (Accès : *Tout le monde*).
3. Coller l'URL se terminant par `/exec` dans [js/config.js](file:///d:/OneDrive/Code/Co%20voit/js/config.js).
4. Activer **GitHub Pages** sur le dépôt GitHub.
