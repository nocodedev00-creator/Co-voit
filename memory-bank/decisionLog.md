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

## 2026-09-21 : Améliorations UX (efficacité & simplicité)

**Contexte** : Audit UX demandé — rendre l'app plus visuelle et simple.

### ✅ Décisions
- **Consultation libre** : suppression de l'identité obligatoire à l'ouverture ; modale demandée uniquement à l'action (`checkUserIdentityFlow(reason)`).
- **Feedback de chargement** : `setButtonLoading()` (spinner + désactivation) sur toutes les actions serveur.
- **Vocabulaire unifié** : "Je conduis" / "Je cherche" / "Je m'y rends seul" ; "Recherchent" remplace "À véhiculer".
- **Bilan en héros** : `#global-status-indicator` agrandi (texte base, bordure 2px) = chiffre clé en avant.
- **Admin** : boutons libellés (plus d'icônes seules).
- **Copie** : `navigator.clipboard` avec repli `execCommand`.
- **Note** : `ClientJS.html` > 1100 lignes → candidat à un découpage futur (règle 300 lignes).

## 2026-09-21 : Retours utilisateur (couleurs & état vide)

### ✅ Décisions
- **Code couleur Aller/Retour** : Aller = **bleu**, Retour = **orange** (les deux bleus n'étaient pas distinguables). Appliqué : bilan, cartes véhicules, boutons "Monter", modale détails.
- **État vide neutre** : 0 joueur inscrit → fenêtre **grise** "Aucune inscription pour le moment" (plus de faux "Places suffisantes").
- **Correctif** : `cine` parasite supprimé dans le handler `btn-quick-direct` (cassait le JS).

## 2026-09-21 : Bilan scindé & places indépendantes

### ✅ Décisions
- **Bilan scindé** : ne plus cumuler les manques Aller+Retour (trajets distincts). Affichage "Il manque Aller : X • Retour : Y place(s)".
- **Places Aller/Retour indépendantes** : défaut 3/3 dans la modale "Je conduis". Synchro Aller→Retour uniquement tant que le Retour n'est pas touché (`dataset.userTouched`). En édition, Retour marqué "touché" pour préserver la valeur.

## 2026-09-21 : Heure hh:mm & bilan scindé en 2 blocs

### ✅ Décisions
- **Heure hh:mm** : `formatShortTime` gère les objets Date (Google Sheets renvoie une date complète pour une heure) en plus des chaînes "HH:MM".
- **Bilan scindé en 2 blocs** : `#global-status-indicator` remplacé par `#global-status-outward` + `#global-status-return`. État visuel immédiat : ✅ vert (libre/complet), ❌ rouge (manque X), gris (aucune donnée). Lecture instantanée du manque par sens.

## 2026-09-21 : Suppression du bloc bilan redondant

### ✅ Décision
- Le bloc `#global-status-outward`/`#global-status-return` (ajouté précédemment) était **redondant** avec le détail ALLER/RETOUR existant (`#badge-bilan-outward`/`#badge-bilan-return`). Supprimé du HTML + code JS mort (`applyStatus`) retiré. Le détail A/R reste la seule source du bilan.

## 2026-09-21 : Cohérence couleur boutons "Monter"

### ✅ Décision
- Les boutons "+ Monter à l'Aller/Retour" (dans les cartes véhicules) reprennent les **couleurs des blocs bilan** correspondants : Aller = `bg-blue-50/70` + `border-blue-200` + texte `blue-900` ; Retour = `bg-orange-50/70` + `border-orange-300` + texte `orange-900`. Objectif : repère visuel cohérent, l'utilisateur ne se perd pas entre le bilan et les actions.

## 2026-09-21 : Restriction des boutons "Monter" selon la liste d'attente

### ✅ Décision
- Si un joueur est en liste d'attente pour **un seul sens** (ex. Retour uniquement), il ne peut rejoindre un véhicule que dans ce sens. Évite les incohérences (chercher une place Retour mais monter à l'Aller).

### ✅ Double garde (client + serveur)
- **Client** : `createRideCardElement(ride, isLocked, waitingList)` reçoit `waiting` **explicitement** (au lieu de lire `AppState.currentMatchData`, source de fragilité). Normalisation booléenne `toBool` (Sheets peut renvoyer "true"/"false" en chaîne ; `Boolean("false")` vaut `true`). Masque le bouton "+ Monter" du sens non demandé.
- **Serveur** : `ctrlJoinRide` refuse l'action si le joueur est en liste d'attente et que le sens demandé n'est pas dans ses besoins. Garantie absolue même si le client est contourné/obsolète.
- **Cause du "ça ne marche pas"** : probablement déploiement non rafraîchi (Gérer les déploiements → Nouvelle version) ou cache navigateur. La garde serveur rend le comportement fiable indépendamment du client.

## 2026-09-21 : Carte véhicule en 2 colonnes (Aller gauche / Retour droite)

### ✅ Décision
- Les segments ALLER et RETOUR d'une carte véhicule sont affichés **côte à côte** (Aller à gauche, Retour à droite), alignés sur le layout du bloc "Bilan des places".
- L'en-tête (avatar + nom conducteur + badge Direct + bouton supprimer) reste **pleine largeur** au-dessus.
- **Implémentation robuste** : conteneur `style="display:flex; flex-direction:row; gap:0.75rem; align-items:stretch;"` + chaque segment `style="flex:1 1 0; min-width:0;"`. On n'utilise **pas** `grid-cols-2` de Tailwind pour ce bloc, afin d'éviter tout risque de purge/JIT ou de cache. Le côte-à-côte est garanti par CSS inline.
## 2026-09-26 : Migration découplée GitHub Pages + API Apps Script & Fix heure 00:09
- **Problème** : Conflits multi-comptes Google sur mobile & webviews WhatsApp bloquaient l'accès à la Web App ("Impossible d'ouvrir le fichier").
- **Solution** : Architecture découplée. Front-end statique hébergé sur GitHub Pages (accès public immédiat sans compte Google), Backend Apps Script converti en API REST JSON (`doPost`/`doGet` avec `ContentService`).
- **Fix Heure 00:09** : Google Sheets stockait les heures en objets Date fixés au 30/12/1899 (entraînant 00:09 avec le fuseau de Paris en 1899). Résolu par extraction explicite de `HH:mm` dans `Database.gs`, `Utils.gs` et `js/ui-utils.js`.
- **Accueil** : Ajout du formulaire de saisie `ADMIN_TOKEN` sur la page d'accueil pour accès Coach direct sans devoir modifier l'URL.

## 2026-09-27 : Configuration Google Clasp pour synchronisation automatique Apps Script
- **Problème** : Copier-coller manuels des 4 fichiers `.gs` dans l'éditeur Google Sheets à chaque mise à jour.
- **Solution** : Configuration de Google Clasp (`.clasp.json` lié au script `1yyBMcI-...`, `.claspignore` filtrant uniquement les 5 fichiers backend, `appsscript.json`). Règle système intégrée : `npx @google/clasp push` systématique après chaque modification backend.
