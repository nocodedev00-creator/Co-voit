# Journal des Décisions Techniques & Résolutions

Ce document trace l'historique des problèmes techniques complexes et les solutions validées pour éviter les régressions.

## 2026-09-21 : Analyse initiale & remplissage Memory Bank

**Contexte** : Projet Co'Voit — Web App Google Apps Script de covoiturage événementiel. Analyse des fichiers pour initialiser la Memory Bank.

### Constats
- Seul `ClientJS.html` (1110 lignes) est implémenté ; tous les `.gs` et autres `.html` sont vides (0 octet).
- Le client définit un contrat d'API implicite : 13 méthodes `ctrl*` + objet `window.SERVER_ROUTING`.

### ✅ Décisions
- **Architecture** : SPA Apps Script avec pont RPC `google.script.run` encapsulé dans `callServer` (Promise).
- **Contrat serveur** : retour `{ success: boolean, data?, error? }`.
- **Organisation** : structure plate Apps Script (pas de `src/`), conforme à la réalité du projet.
- **Règle métier** : places Aller et Retour indépendantes ; cas "Direct" = `is_direct` + `seats_* = 0`.
- **Sécurité** : actions admin protégées par `adminToken`.

## 2026-09-21 : Erreur "Impossible d'ouvrir le fichier pour le moment"

**Contexte** : Page d'erreur générique Google à l'ouverture de la Web App.

### Diagnostic
- Ce n'est PAS un bug de code (le code est complet et cohérent).
- Cause : Web App non déployée / URL `/edit` ou `/dev` au lieu de `/exec` / déploiement obsolète.
- Script confirmé **lié à un Google Sheet** (donc `getActiveSpreadsheet()` OK).

### ✅ Solution
- Déployer en **Application Web** (Exécuter en tant que : Moi ; Accès : Tout le monde).
- Utiliser l'URL **`/exec`**.
- Après chaque modif : **Gérer les déploiements → Nouvelle version**.
- **Robustesse** : `Index.html` — remplacé `JSON.parse('<?= JSON.stringify(serverRouting) ?>')` (fragile aux apostrophes) par `<?!= JSON.stringify(serverRouting) ?>`.

### ✅ Durcissement (2e passe)
- `Code.gs` : `doGet` blindé — `initDatabase()` + `ScriptApp.getService().getUrl()` en `try/catch`. Ajout `initError` dans `SERVER_ROUTING`.
- `appscript.json` : scopes OAuth complétés (`script.external_request`, `script.scriptapp`) pour `ScriptApp.getService()`.
- `Index.html`/`ClientJS.html` : bandeau diagnostic `#view-init-error` si `initError`.
- **Cause racine probable** : URL `/edit` ou `/dev` au lieu de `/exec`, ou déploiement non (re)créé après modif.

## 2026-09-21 : Multi-comptes Google (authuser) — Firefox vs Chrome

**Contexte** : L'app plante sur Firefox (plusieurs comptes Google connectés) mais fonctionne sur Chrome.

### Diagnostic
- Google affiche un écran de sélection de compte AVANT d'exécuter la Web App → erreur Drive générique.
- Ce n'est pas un bug de code : la redirection est antérieure à l'exécution.

### ✅ Décision (Option A retenue)
- Propager `authuser` (index du compte) dans tous les liens générés par l'app.
- `Code.gs` : `params.authuser` → `SERVER_ROUTING.authUser`.
- `ClientJS.html` : `AppState.authUser` + helper `buildAppUrl()`.
- `Controllers.gs` : `ctrlGetWhatsAppSummary(..., authUser)` → `&authuser=` dans le lien public.
- **Alternative écartée** : Option B (hébergement statique + Apps Script en API) — garantie 100% mais migration lourde.


