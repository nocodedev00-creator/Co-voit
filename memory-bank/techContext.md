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
- **Sécurité** : Accès admin protégé par `adminToken` (passé en paramètre des contrôleurs). Scopes OAuth limités à `spreadsheets` et `script.container.ui`.
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

- `Code.gs` : Point d'entrée serveur (`doGet`, routage, injection `SERVER_ROUTING`). *(actuellement vide)*
- `Controllers.gs` : Contrôleurs exposés au client (`ctrl*`). *(actuellement vide)*
- `Database.gs` : Couche d'accès aux données (Google Sheets). *(actuellement vide)*
- `Utils.gs` : Fonctions utilitaires serveur. *(actuellement vide)*
- `Index.html` : Shell HTML principal (SPA). *(actuellement vide)*
- `AdminView.html` : Vue admin. *(actuellement vide)*
- `MatchView.html` : Vue joueur/match. *(actuellement vide)*
- `Styles.html` : Styles CSS. *(actuellement vide)*
- `ClientJS.html` : Logique client SPA complète (état, rendu, handlers). *(implémenté — 1110 lignes)*
- `appscript.json` : Manifeste de déploiement.

## État Actuel du Code
- **Implémenté** : `ClientJS.html` (couche client complète).
- **Vides (0 octet)** : `Code.gs`, `Controllers.gs`, `Database.gs`, `Utils.gs`, `Index.html`, `AdminView.html`, `MatchView.html`, `Styles.html`.
- **Conséquence** : Le backend et les vues HTML restent à implémenter pour que l'app fonctionne.
