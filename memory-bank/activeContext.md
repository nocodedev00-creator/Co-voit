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

## Améliorations UX appliquées (2026-09-21)
- **Consultation libre** : la modale d'identité n'est plus imposée à l'ouverture de la vue Match. Elle n'apparaît qu'au moment d'une action (`checkUserIdentityFlow(reason)` avec message contextuel `#identity-reason`).
- **Feedback de chargement** : helper `setButtonLoading(btn, isLoading, text)` — spinner + désactivation sur les boutons d'action (rejoindre/quitter/supprimer).
- **Vocabulaire unifié** : boutons joueur = "Je conduis" / "Je cherche" / "Je m'y rends seul" ; "À véhiculer" → "Recherchent" ; "Direct sur place" → "Je m'y rends seul".
- **Bilan des places en héros** : `#global-status-indicator` affiché en grand (texte base, padding, bordure 2px) au-dessus des détails A/R.
- **Vue Admin** : boutons avec libellés courts ("Lien joueur", "Voir", "Verrouiller", "WhatsApp", "Supprimer le match") au lieu d'icônes seules.
- **Copie WhatsApp** : `navigator.clipboard.writeText` avec repli `execCommand`.
- **Code couleur Aller/Retour** : Aller = **bleu**, Retour = **orange** (au lieu de deux bleus). Appliqué partout : bilan, cartes véhicules, boutons "Monter", modale détails.
- **État vide neutre** : quand 0 joueur inscrit, `#global-status-indicator` affiche une fenêtre **grise** "Aucune inscription pour le moment" (au lieu de "Places suffisantes").
- **Correctif** : suppression d'un `cine` parasite (erreur de syntaxe) dans le handler `btn-quick-direct`.
- **Bilan scindé** : le manque de places n'est plus cumulé Aller+Retour. Affichage séparé ("Il manque Aller : X • Retour : Y place(s)") car ce sont des trajets distincts.
- **Places Aller/Retour indépendantes (modale "Je conduis")** : défaut 3/3. La synchro Aller→Retour ne s'applique que tant que l'utilisateur n'a pas touché au champ Retour (`dataset.userTouched`). En édition, le Retour est marqué "touché" pour préserver la valeur existante.
- **Heure hh:mm** : `formatShortTime` gère désormais les objets Date renvoyés par Google Sheets (en plus des chaînes "HH:MM").
- **Bilan scindé** : le manque de places n'est plus cumulé Aller+Retour. Le détail ALLER/RETOUR (badges `#badge-bilan-outward`/`#badge-bilan-return`) est la seule source d'affichage du bilan (bloc `#global-status-*` redondant supprimé).
- **Cohérence couleur boutons "Monter"** : les boutons "+ Monter à l'Aller/Retour" reprennent les couleurs des blocs bilan correspondants (Aller = `bg-blue-50/70` + `border-blue-200` ; Retour = `bg-orange-50/70` + `border-orange-300`) pour ne pas perdre l'utilisateur.
- **Restriction liste d'attente (double garde)** : si un joueur cherche une place pour UN SEUL sens, il ne peut rejoindre un véhicule que dans ce sens.
  - **Client** : `createRideCardElement(ride, isLocked, waitingList)` reçoit désormais `waiting` explicitement (plus de dépendance à `AppState.currentMatchData`). Calcule `canJoinOutward`/`canJoinReturn` (normalisation booléenne `toBool` car Sheets peut renvoyer "true"/"false" en chaîne) et masque le bouton "+ Monter" du sens non demandé.
  - **Serveur** : `ctrlJoinRide` refuse (responseError) si le joueur est en liste d'attente et que le sens demandé n'est pas dans ses besoins. Garantie absolue même si le client est contourné.
- **Carte véhicule en 2 colonnes** : les segments ALLER (gauche, bleu) et RETOUR (droite, orange) sont désormais côte à côte via **CSS inline flex** (`display:flex` + `flex:1 1 0` sur chaque segment), aligné sur le layout du bloc "Bilan des places". L'en-tête (nom conducteur + bouton supprimer) reste **pleine largeur** au-dessus. Compteurs passagers raccourcis (`X / Y`). (Le `grid-cols-2` Tailwind a été abandonné au profit du flex inline pour éviter tout risque de purge/cache.)
- **Chips "Libre"** : pour chaque place encore disponible (Aller et Retour), une chip en pointillés "Libre" est affichée après les passagers inscrits. Helper `createFreeSeatChip(direction)` (bleu pour Aller, orange pour Retour). Le nombre de chips "Libre" = `seats - passengers.length`, recalculé à chaque re-render → une chip disparaît automatiquement dès qu'un joueur s'inscrit.










## Points d'Attention
- Le client attend `window.SERVER_ROUTING` injecté par `doGet`.
- Contrat serveur : `{ success: boolean, data?, error? }`.
- Places Aller/Retour **indépendantes** ; cas "Direct" = `is_direct` + `seats_* = 0`.
- Accès admin protégé par `adminToken` (comparé à `CONFIG.ADMIN_TOKEN`).
- `SERVER_ROUTING` contient aussi `authUser` et `initError`.
- Les handlers `handleJoinRide`/`handleLeaveRide`/`handleDeleteVehicle`/`handleLeaveWaitingList` acceptent désormais un paramètre `btn` optionnel pour le feedback de chargement.


