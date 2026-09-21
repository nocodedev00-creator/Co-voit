# Architecture Système & Patterns

## Architecture Globale
Le projet suit une architecture **SPA (Single Page Application) hébergée sur Google Apps Script**, de type **client-serveur avec pont RPC**.

- **Serveur (Apps Script)** : `Code.gs` (routage + `doGet`), `Controllers.gs` (API `ctrl*`), `Database.gs` (accès Sheets), `Utils.gs` (helpers).
- **Client (HTML/JS)** : `Index.html` (shell), `AdminView.html` / `MatchView.html` (vues), `Styles.html`, `ClientJS.html` (logique).
- **Communication** : `google.script.run` encapsulé dans une Promise (`callServer`).

### Routage
Le serveur injecte un objet `window.SERVER_ROUTING` dans la page, contenant :
- `route` : `ADMIN` | `MATCH` | `NO_ACCESS`
- `matchId` : identifiant du match (si route MATCH)
- `adminToken` : jeton admin (si route ADMIN)
- `webAppUrl` : URL de base de la Web App

Le client lit cet objet dans `AppState` et affiche la vue correspondante au `DOMContentLoaded`.

## Design Patterns Clés

### 1. Gestion d'État (Client)
- **Concept** : Objet global unique `AppState` (route, matchId, adminToken, currentUser, currentMatchData, adminMatches).
- **Règle** : L'identité joueur est persistée dans `localStorage` (`covoid_username`). Pas de mutation directe du DOM sans passer par les fonctions de rendu.

### 2. Communication Serveur (RPC)
- **Concept** : Tous les appels serveur passent par `callServer(methodName, ...args)` qui retourne une Promise.
- **Contrat** : Le serveur renvoie `{ success: true, data }` ou `{ success: false, error }`. Le client rejette la Promise si `success === false`.

### 3. Gestion des Erreurs
- **Concept** : `showToast(message, type)` affiche les erreurs/succès (`info` | `success` | `error`). Les erreurs serveur remontent via le rejet de `callServer`.

### 4. Modèle de Données (Domaine)
- **Match** : `title`, `event_date`, `departure_time`, `meeting_place`, `is_locked`.
- **Ride (véhicule)** : `driver_name`, `offers_outward`, `offers_return`, `seats_outward`, `seats_return`, `is_direct`, `outward_passengers[]`, `return_passengers[]`.
- **Waiting (liste d'attente)** : `player_name`, `needs_outward`, `needs_return`.
- **Règle métier clé** : Les places **Aller** et **Retour** sont **indépendantes** (un passager peut ne faire qu'un sens).
- **Cas "Direct"** : `is_direct = true` + `seats_* = 0` ⇒ joueur se rend par ses propres moyens (affiché 🚶).

### 5. Sécurité Admin
- **Concept** : Les actions admin (`ctrlCreateMatch`, `ctrlDeleteMatch`, `ctrlToggleMatchLock`, `ctrlGetAdminMatches`, `ctrlGetWhatsAppSummary`) exigent un `adminToken` validé côté serveur.

## Flux de Données Type
1. **Input** : Le joueur saisit son nom (modale identité) → `setUsername` → `localStorage`.
2. **Traitement** : Action (rejoindre/quitter un véhicule, liste d'attente) → `callServer('ctrl*', ...)`.
3. **Stockage/État** : Le serveur écrit dans Google Sheets ; le client met à jour `AppState.currentMatchData`.
4. **Output** : `renderMatchView` / `renderAdminMatches` reconstruisent le DOM ; `calculateAndRenderSummary` calcule les soldes de places.

## Contrat d'API Client → Serveur (déduit de ClientJS.html)
| Méthode serveur | Arguments | Rôle |
| :--- | :--- | :--- |
| `ctrlGetMatchDetails` | `matchId` | Détails match + rides + waiting_list |
| `ctrlJoinRide` | `matchId, rideId, playerName, direction` | Rejoindre un véhicule (outward/return) |
| `ctrlLeaveRide` | `matchId, rideId, playerName, direction` | Quitter un véhicule |
| `ctrlDeleteVehicle` | `matchId, rideId, playerName, adminToken` | Supprimer un véhicule |
| `ctrlLeaveWaitingList` | `matchId, waitingId, playerName, adminToken` | Retirer de la liste d'attente |
| `ctrlRegisterVehicle` | `matchId, payload` | Créer un véhicule |
| `ctrlUpdateVehicle` | `matchId, rideId, driverName, payload` | Modifier un véhicule |
| `ctrlJoinWaitingList` | `matchId, playerName, needsOut, needsRet` | S'inscrire en liste d'attente |
| `ctrlGetAdminMatches` | `adminToken` | Liste des matchs (vue admin) |
| `ctrlCreateMatch` | `adminToken, payload` | Créer un match |
| `ctrlToggleMatchLock` | `adminToken, matchId, isLocked` | Verrouiller/déverrouiller |
| `ctrlDeleteMatch` | `adminToken, matchId` | Supprimer un match |
| `ctrlGetWhatsAppSummary` | `adminToken, matchId, webAppUrl` | Générer la synthèse WhatsApp |
