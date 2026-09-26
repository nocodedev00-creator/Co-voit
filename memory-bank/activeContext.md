# Contexte Actif

## Travail Réalisé & Validé
Migration complète et réussie de l'application Co'Voit' vers une **architecture découplée** :
- **Front-end statique autonome sur GitHub Pages** (`https://nocodedev00-creator.github.io/Co-voit/`) : suppression définitive des erreurs *"Google Drive - impossible d'ouvrir le fichier"* et des conflits multi-comptes sur smartphone.
- **Backend Google Apps Script en mode API REST JSON** : conservation du classeur Google Sheets et des règles métier.
- **Résolution du bug de l'heure (00:09)** : neutralisation de l'anomalie 1899 de Google Sheets dans `Database.gs`, `Utils.gs` et `js/ui-utils.js`.
- **Écran d'accueil interactif** : ajout d'un champ de connexion Coach pour entrer son `ADMIN_TOKEN` en un clic sans paramètre d'URL.
- **Validation utilisateur** : testé et confirmé comme fonctionnel sur mobile.

## Documentation
- `README.md` disponible à la racine du projet pour guider le coach et les développeurs.
