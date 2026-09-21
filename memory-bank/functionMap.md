# Cartographie des Fonctions

Ce document recense les fonctions clés du projet pour faciliter la maintenance et le debugging.
*À mettre à jour par l'IA à chaque ajout de fonctionnalité majeure.*

> ⚠️ Le projet suit une organisation **plate Google Apps Script** (pas de `src/`).
> Les fichiers `.gs` et la plupart des `.html` sont **actuellement vides** — seules les fonctions de `ClientJS.html` sont implémentées.

## 📁 `ClientJS.html` (Logique Client SPA)

| Fonction | Description |
| :--- | :--- |
| `AppState` (objet) | État global : route, matchId, adminToken, webAppUrl, currentUser, currentMatchData, adminMatches. |
| `safeLower(val)` | Normalise une valeur en chaîne minuscule trimée (comparaisons de noms). |
| `formatShortDate(dateStr)` | Formate une date ISO en `JJ/MM/AA`. |
| `formatShortTime(timeStr)` | Formate une heure en `HH:MM`. |
| `callServer(methodName, ...args)` | Encapsule `google.script.run` dans une Promise ; gère `{success, data/error}`. |
| `showToast(message, type)` | Affiche une notification temporaire (info/success/error). |
| `escapeHtml(str)` | Échappe le HTML (protection XSS). |
| `openModal(modalId)` / `closeModal(modalId)` | Affiche/masque une modale. |
| `setUsername(name)` | Définit et persiste le nom joueur (`localStorage`). |
| `updateUserDisplay()` | Met à jour l'affichage du nom courant. |
| `checkUserIdentityFlow()` | Gère la modale d'identité (connu/inconnu) sur la route MATCH. |
| `loadMatchDetails()` | Charge les détails du match via `ctrlGetMatchDetails` puis rend la vue. |
| `renderMatchView(data)` | Rend la vue match (titre, statut, résumé, véhicules, liste d'attente). |
| `calculateAndRenderSummary(rides, waiting)` | Calcule et affiche les soldes de places Aller/Retour et l'indicateur global. |
| `openSummaryDetailsModal()` | Construit et affiche la modale de synthèse détaillée (Aller puis Retour). |
| `renderChipsList(containerId, list, chipClasses, emptyText)` | Rend une liste de "chips" dans un conteneur. |
| `renderUserCurrentStatus(rides, waiting, isLocked)` | Affiche le statut de l'utilisateur (conducteur / passager / en attente). |
| `openEditRideModal(ride)` | Ouvre la modale d'édition d'un véhicule pré-remplie. |
| `createRideCardElement(ride, isLocked)` | Construit la carte DOM d'un véhicule (segments Aller/Retour). |
| `createPassengerChip(rideId, name, direction, isLocked)` | Crée une "chip" passager avec bouton de retrait. |
| `handleJoinRide(rideId, direction)` | Rejoint un véhicule (`ctrlJoinRide`). |
| `handleLeaveRide(rideId, playerName, direction)` | Quitte un véhicule (`ctrlLeaveRide`). |
| `handleDeleteVehicle(rideId)` | Supprime un véhicule (`ctrlDeleteVehicle`). |
| `handleLeaveWaitingList(waitingId)` | Retire de la liste d'attente (`ctrlLeaveWaitingList`). |
| `loadAdminDashboard()` | Charge les matchs admin (`ctrlGetAdminMatches`). |
| `renderAdminMatches(matches)` | Rend la liste des matchs (vue admin) avec actions. |
| `DOMContentLoaded` (handler) | Initialise la vue selon `AppState.route` et branche tous les handlers d'événements. |

## 📁 `Code.gs` (Serveur — Point d'entrée) — *VIDE*

| Fonction | Description |
| :--- | :--- |
| `doGet(e)` | *(à implémenter)* Routage + injection `SERVER_ROUTING`. |

## 📁 `Controllers.gs` (Serveur — API) — *VIDE*

| Fonction | Description |
| :--- | :--- |
| `ctrlGetMatchDetails` | *(à implémenter)* |
| `ctrlJoinRide` / `ctrlLeaveRide` | *(à implémenter)* |
| `ctrlDeleteVehicle` | *(à implémenter)* |
| `ctrlLeaveWaitingList` / `ctrlJoinWaitingList` | *(à implémenter)* |
| `ctrlRegisterVehicle` / `ctrlUpdateVehicle` | *(à implémenter)* |
| `ctrlGetAdminMatches` / `ctrlCreateMatch` | *(à implémenter)* |
| `ctrlToggleMatchLock` / `ctrlDeleteMatch` | *(à implémenter)* |
| `ctrlGetWhatsAppSummary` | *(à implémenter)* |

## 📁 `Database.gs` (Serveur — Données) — *VIDE*

| Fonction | Description |
| :--- | :--- |
| *(à implémenter)* | Accès Google Sheets (matchs, rides, waiting list). |

## 📁 `Utils.gs` (Serveur — Utilitaires) — *VIDE*

| Fonction | Description |
| :--- | :--- |
| *(à implémenter)* | Helpers serveur (validation, formatage, sécurité token). |
