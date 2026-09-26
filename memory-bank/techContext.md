# Contexte Technique

## Stack Logicielle
- **Front-end** : GitHub Pages (hébergement statique autonome, sans compte Google requis pour l'affichage)
  - HTML5 SPA + Tailwind CSS (via CDN)
  - Vanilla JavaScript ES6 modulaire (aucun bundler requis)
  - `fetch()` REST vers l'API Google Apps Script
- **Back-end & Persistance** : Google Apps Script Web App (API JSON) + Google Sheets
  - `doPost(e)` / `doGet(e)` avec `ContentService` (format JSON)
  - `SpreadsheetApp` (persistance Google Sheets avec ORM léger et auto-migration)
  - `LockService` (concurrence & intégrité des transactions)
- **Stockage Local** : `localStorage` (mémorisation de l'identité joueur `covoid_username`)

## Architecture Découplée (Front Statique + Back API)
- **Front-end** : Servit directement par GitHub Pages depuis la racine (`index.html`).
- **Communication** : Requêtes HTTP POST avec `Content-Type: text/plain;charset=utf-8` pour éviter les blocages de prévol CORS (`OPTIONS`) sur Apps Script.
- **Routage** : Lecture autonome des paramètres dans l'URL (`?m=xxx` pour les joueurs, `?admin=xxx` pour le coach).
- **Zéro dépendance de session Google** : Les joueurs n'ouvrent plus le domaine `script.google.com`, éliminant 100% des erreurs Google Drive et multi-comptes sur mobile.

## Structure des Dossiers

```
Co-voit/
├── .gitignore               # Exclusions Git (fichiers système, IDE, logs, secrets)
├── index.html               # Page d'accueil SPA autonome pour GitHub Pages
├── styles.css               # Feuilles de styles CSS mobiles et animations
├── js/                      # Modules JavaScript (< 300 lignes chacun)
│   ├── config.js            # Configuration de l'URL d'API Google Apps Script
│   ├── state.js             # État global (AppState) et routage d'URL
│   ├── api.js               # Passerelle réseau fetch() remplaçant google.script.run
│   ├── ui-utils.js          # Utilitaires (toasts, modales, identité, boutons)
│   ├── ui-match-summary.js  # Calculs de solde de places et modale de synthèse A/R
│   ├── ui-match-cards.js    # Rendu des cartes véhicules et chips passagers
│   ├── ui-match-render.js   # Rendu principal de la vue match et statut joueur
│   ├── ui-match-actions.js  # Handlers de clic (rejoindre, quitter, annuler)
│   ├── ui-admin.js          # Tableau de bord et gestion des matchs pour le coach
│   └── app.js               # Initialisation DOMContentLoaded et écouteurs
├── Code.gs                  # Routeur API REST JSON Google Apps Script (doPost / doGet)
├── Controllers.gs           # 13 endpoints métier (sécurisés par LockService)
├── Database.gs              # ORM léger sur Google Sheets
├── Utils.gs                 # Utilitaires serveur & synthèse WhatsApp
├── appscript.json           # Manifeste Apps Script
└── memory-bank/             # Mémoire persistante du projet
```
