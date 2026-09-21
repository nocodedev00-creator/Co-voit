# Contexte Technique

## Stack Logicielle
- **Core** : Google Apps Script (runtime V8)
- **Framework** : Aucun framework front — SPA vanilla JS + Tailwind CSS (CDN/classes utilitaires)
- **Dépendances Clés** :
  - `google.script.run` (pont client ↔ serveur Apps Script)
  - `SpreadsheetApp` (persistance Google Sheets)
  - `HtmlService` (rendu des vues HTML)
  - `localStorage` (identité joueur côté client)

## Contraintes & Choix Architecturaux
- **Performance** : Appels serveur asynchrones via Promises (`callServer`), rechargement ciblé des vues.
- **Compatibilité** : Web App Google Apps Script, exécution `USER_DEPLOYING`, accès `ANYONE_ANONYMOUS`.
- **Sécurité** : Accès admin protégé par `adminToken` (passé en paramètre des contrôleurs). Scopes OAuth : `spreadsheets`, `script.container.ui`, `script.external_request`, `script.scriptapp`.
- **Persistance** : Google Sheets comme base de données (pas de SGBD externe).

## Configuration Apps Script (`appscript.json`)
- `timeZone` : `Europe/Paris`
- `runtimeVersion` : `V8`
- `webapp.executeAs` : `USER_DEPLOYING`
- `webapp.access` : `ANYONE_ANONYMOUS`
- `exceptionLogging` : `STACKDRIVER`
- `oauthScopes` : `spreadsheets`, `script.container.ui`

## Structure des Dossiers (Réelle)
> ⚠️ Le projet n'utilise PAS la structure `src/core|services|ui|utils` par défaut.
> Il suit une organisation **plate typique Google Apps Script** (fichiers à la racine).

- `Code.gs` : Point d'entrée serveur (`doGet`, routage, injection `SERVER_ROUTING`). *(implémenté — `doGet` blindé try/catch)*
- `Controllers.gs` : Contrôleurs exposés au client (`ctrl*`). *(implémenté — 13 endpoints)*
- `Database.gs` : Couche d'accès aux données (Google Sheets). *(implémenté — ORM + auto-migration)*
- `Utils.gs` : Fonctions utilitaires serveur. *(implémenté)*
- `Index.html` : Shell HTML principal (SPA). *(implémenté — bandeau diagnostic `initError`)*
- `AdminView.html` : Vue admin. *(implémenté)*
- `MatchView.html` : Vue joueur/match. *(implémenté)*
- `Styles.html` : Styles CSS. *(implémenté)*
- `ClientJS.html` : Logique client SPA complète (état, rendu, handlers). *(implémenté — 1110 lignes)*
- `appscript.json` : Manifeste de déploiement. *(scopes OAuth complétés)*

## État Actuel du Code
- **Implémenté** : l'intégralité du projet (client + serveur + vues + manifeste).
- **Reste à faire** : déploiement Web App et test end-to-end.
