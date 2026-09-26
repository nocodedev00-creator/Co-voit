# Contexte Actif

## Travail Réalisé & Validé
Migration complète et réussie de l'application Co'Voit' vers une **architecture découplée** :
- **Front-end statique autonome sur GitHub Pages** (`https://nocodedev00-creator.github.io/Co-voit/`) : suppression définitive des erreurs *"Google Drive - impossible d'ouvrir le fichier"* et des conflits multi-comptes sur smartphone.
- **Backend Google Apps Script en mode API REST JSON** : conservation du classeur Google Sheets et des règles métier.
- **Résolution du bug de l'heure (00:09)** : neutralisation définitive de l'anomalie 1899 de Google Sheets :
  - `Database.gs` : lecture via `getDisplayValues()` pour extraire directement le texte brut affiché ("17:30") et écriture forcée en texte via préfixe apostrophe (`'`).
  - `Utils.gs` & `js/ui-utils.js` : `formatShortTime` durci pour refuser les dates pures sans heure (comme "1899-12-30") et renvoyer `--:--` au lieu de calculer un fuseau erroné.
- **Action Déploiement en cours** : mise à jour du script Google Apps Script (`Database.gs` et `Utils.gs`) avec création d'une "Nouvelle version" dans le déploiement Web App.
- **Écran d'accueil interactif** : ajout d'un champ de connexion Coach pour entrer son `ADMIN_TOKEN` en un clic sans paramètre d'URL.
- **Validation utilisateur** : testé et confirmé comme fonctionnel sur mobile.

## Documentation
- `README.md` disponible à la racine du projet pour guider le coach et les développeurs.
