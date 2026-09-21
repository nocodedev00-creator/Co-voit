# Contexte Actif

## Travail en Cours
Projet **Co'Voit** — Web App Google Apps Script de covoiturage événementiel.
Le code est désormais **complet** (client + serveur + vues). Diagnostic d'une erreur de déploiement en cours.

## État du Code (à jour)
- ✅ `ClientJS.html` : logique client SPA complète.
- ✅ `Code.gs` : `doGet(e)`, routage (`ADMIN`/`MATCH`/`NO_ACCESS`), injection `SERVER_ROUTING`, `include()`.
- ✅ `Controllers.gs` : 13 endpoints `ctrl*` (admin + joueurs).
- ✅ `Database.gs` : ORM léger Google Sheets avec auto-migration (`initDatabase`, `getTableRecords`, `insertRecord`, `updateRecord`, `deleteRecord`, `deleteRecordsWhere`, `getConfigValue`, `setConfigValue`).
- ✅ `Utils.gs` : `withScriptLock`, `generateId`, `formatDateFrench`, `formatWhatsAppSummary`, `responseSuccess`, `responseError`.
- ✅ `Index.html` : shell SPA (vues, modales, toasts, injection routage).
- ✅ `AdminView.html`, `MatchView.html`, `Styles.html` : vues et styles.
- ✅ `appscript.json` : config Web App.

## Problème en Cours : "Impossible d'ouvrir le fichier pour le moment"
- **Nature** : page d'erreur générique Google (pas un bug de code).
- **Cause probable** : Web App non déployée, ou URL `/edit`/`/dev` utilisée au lieu de `/exec`, ou déploiement obsolète.
- **Config confirmée** : script **lié à un Google Sheet** (donc `getActiveSpreadsheet()` fonctionne).
- **Corrections appliquées (durcissement)** :
  1. `Index.html` : injection `SERVER_ROUTING` robuste (`<?!= JSON.stringify(serverRouting) ?>`).
  2. `Code.gs` : `doGet` blindé — `initDatabase()` et `ScriptApp.getService().getUrl()` encapsulés dans des `try/catch` (une erreur d'init ne bloque plus l'affichage). Ajout de `initError` dans `SERVER_ROUTING`.
  3. `appscript.json` : scopes OAuth complétés (`script.external_request`, `script.scriptapp`) — nécessaires pour `ScriptApp.getService()`.
  4. `Index.html` + `ClientJS.html` : bandeau de diagnostic `#view-init-error` affiché si `initError` est présent.

## Procédure de déploiement (rappel)
1. **Déployer → Nouveau déploiement → Application Web**.
2. Exécuter en tant que : *Moi* ; Accès : *Tout le monde*.
3. Utiliser l'URL se terminant par **`/exec`**.
4. Token admin : onglet `CONFIG` du Sheet (clé `ADMIN_TOKEN`, auto-généré).
5. Après modif : **Gérer les déploiements → Nouvelle version**.

## Gestion Multi-Comptes Google (authuser)
- **Symptôme** : l'app plante sur Firefox (multi-comptes Google) mais marche sur Chrome.
- **Cause** : Google affiche un écran de sélection de compte avant d'exécuter la Web App → erreur Drive générique.
- **Solution (Option A)** : propagation du paramètre `authuser` (index du compte) dans tous les liens générés.
  - `Code.gs` : lit `params.authuser` → injecté dans `SERVER_ROUTING.authUser`.
  - `ClientJS.html` : `AppState.authUser` + helper `buildAppUrl({...})` (ajoute `authuser`).
  - `Controllers.gs` : `ctrlGetWhatsAppSummary(..., authUser)` ajoute `&authuser=` au lien public.
- **Limite** : la redirection Google se produit AVANT le code → garantie partielle (~80%). Pour 100%, migrer vers hébergement statique (Option B, non retenue).

## Points d'Attention
- Le client attend `window.SERVER_ROUTING` injecté par `doGet`.
- Contrat serveur : `{ success: boolean, data?, error? }`.
- Places Aller/Retour **indépendantes** ; cas "Direct" = `is_direct` + `seats_* = 0`.
- Accès admin protégé par `adminToken` (comparé à `CONFIG.ADMIN_TOKEN`).
- `SERVER_ROUTING` contient aussi `authUser` et `initError`.
