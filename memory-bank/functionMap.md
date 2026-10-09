# Cartographie des Fonctions

Ce document recense les fonctions clés du projet pour faciliter la maintenance et le debugging.

## 📁 Modules JavaScript Client (`js/`)

### `js/config.js`
| Configuration | Description |
| :--- | :--- |
| `APP_CONFIG.GOOGLE_API_URL` | URL de la Web App Google Apps Script (`/exec`). |

### `js/state.js`
| Élément | Description |
| :--- | :--- |
| `AppState` (objet) | État global : `route`, `matchId`, `adminToken`, `webAppUrl`, `currentUser`, `currentMatchData`, `adminMatches`. |
| `buildAppUrl(extraParams)` | Génère une URL de partage autonome (GitHub Pages) sans paramètre `authuser`. |

### `js/api.js`
| Fonction | Description |
| :--- | :--- |
| `callServer(methodName, ...args)` | Passerelle réseau `fetch` POST (format `text/plain` anti-CORS preflight) vers Google Apps Script. Retourne une Promise résolue avec `data` ou rejetée avec `error`. |

### `js/ui-utils.js`
| Fonction | Description |
| :--- | :--- |
| `safeLower(val)` | Normalise une chaîne en minuscules sans espaces. |
| `formatShortDate(dateStr)` / `formatShortTime(timeStr)` | Formatage de dates (`JJ/MM/AA`) et d'heures (`HH:MM`). |
| `escapeHtml(str)` | Échappement anti-XSS des saisies utilisateur. |
| `showToast(message, type)` | Notifications flottantes temporaires. |
| `openModal(modalId)` / `closeModal(modalId)` | Gestion de l'affichage des fenêtres modales. |
| `setUsername(name)` / `updateUserDisplay()` | Gestion et affichage du nom stocké dans `localStorage`. |
| `checkUserIdentityFlow(reason)` | Déclenchement de la saisie d'identité contextuelle lors d'une action. |
| `setButtonLoading(btn, isLoading, loadingText)` | Spinner et désactivation temporaire des boutons d'action. |

### `js/ui-match-summary.js`
| Fonction | Description |
| :--- | :--- |
| `calculateAndRenderSummary(rides, waiting)` | Calcule les totaux, les places offertes/demandées et actualise les badges A/R. |
| `renderVerdictCard(el, dirLabel, icon, participantsCount, rdvTotal, seats, solde)` | Génère le rendu visuel du bilan Aller ou Retour (Assez de places / Manque / Direct). |
| `openSummaryDetailsModal()` | Construit la liste nominative des joueurs (RDV vs direct, Aller puis Retour). |
| `renderChipsList(containerId, list, chipClasses, emptyText)` | Génère des pastilles visuelles dans la synthèse. |

### `js/ui-match-cards.js`
| Fonction | Description |
| :--- | :--- |
| `createRideCardElement(ride, isLocked, waitingList)` | Construit le DOM d'une carte véhicule (en 2 colonnes Aller gauche / Retour droite). |
| `createPassengerChip(rideId, name, direction, isLocked)` | Pastille passager avec bouton de retrait. |
| `createFreeSeatChip(direction)` | Pastille en pointillés "Libre" pour les places disponibles. |

### `js/ui-match-render.js`
| Fonction | Description |
| :--- | :--- |
| `renderMatchView(data)` | Orchestre l'affichage complet du match, de la liste des voitures et de l'attente. |
| `renderUserCurrentStatus(rides, waiting, isLocked)` | Affiche l'encart d'inscription personnelle de l'utilisateur connecté. |

### `js/ui-match-actions.js`
| Fonction | Description |
| :--- | :--- |
| `loadMatchDetails()` | Récupère les données du match via `ctrlGetMatchDetails`. |
| `openEditRideModal(ride)` | Ouvre la modale de modification des places pour le conducteur. |
| `openWaitingListModal()` | Ouvre et préremplit la modale "Je cherche" (nom + accompagnants). |
| `updateWaitingHint()` | Actualise le bandeau d'explication selon les cases cochées A/R. |
| `handleWaitingFormSubmit(e)` | Valide et enregistre la recherche de place avec accompagnateurs. |
| `handleJoinRide(rideId, direction, btn)` | Inscription d'un passager sur un trajet (gestion des accompagnateurs). |
| `handleLeaveRide(rideId, playerName, direction, btn)` | Désinscription d'un passager et de ses accompagnateurs. |
| `handleDeleteVehicle(rideId, btn)` | Suppression d'un véhicule (bascule automatique des passagers en liste d'attente). |
| `handleLeaveWaitingList(waitingId, btn)` | Sortie de la liste d'attente. |

### `js/ui-admin.js`
| Fonction | Description |
| :--- | :--- |
| `loadAdminDashboard()` | Charge tous les matchs pour le responsable (`ctrlGetAdminMatches`). |
| `renderAdminMatches(matches)` | Génère les cartes d'administration avec actions (verrouillage, lien, WhatsApp, suppression). |

### `js/app.js`
| Événement | Description |
| :--- | :--- |
| `DOMContentLoaded` | Point d'entrée : vérifie la configuration de l'API, oriente vers la bonne vue et attache les écouteurs de formulaires et de boutons. |

---

## 📁 Fichiers Google Apps Script (`.gs`)

### `Code.gs` (Routeur API)
| Fonction | Description |
| :--- | :--- |
| `doPost(e)` / `doGet(e)` | Points d'entrée HTTP. Aiguille vers `handleApiRequest(e)` et retourne du JSON. |
| `handleApiRequest(e)` | Parse la charge utile `{ action, args }`, initialise la DB et invoque le contrôleur cible. |
| `createJsonResponse(data)` | Formate la réponse HTTP avec `ContentService.MimeType.JSON`. |

### `Controllers.gs` (Contrôleurs Métier)
| Fonction | Description |
| :--- | :--- |
| `ctrlVerifyAdminToken(token)` | Valide le jeton secret administrateur. |
| `ctrlGetAdminMatches(adminToken)` | Retourne les rencontres enrichies des totaux de places et d'inscrits. |
| `ctrlCreateMatch(adminToken, payload)` | Crée une nouvelle rencontre sportive. |
| `ctrlToggleMatchLock(adminToken, matchId, isLocked)` | Verrouille/déverrouille les inscriptions. |
| `ctrlDeleteMatch(adminToken, matchId)` | Supprime un match, ses véhicules et ses demandes associées. |
| `ctrlGetWhatsAppSummary(adminToken, matchId, webAppUrl, authUser)` | Génère le texte formaté prêt à coller pour WhatsApp. |
| `ctrlGetMatchDetails(matchId)` | Retourne les données d'un match (véhicules + liste d'attente). |
| `ctrlRegisterVehicle(matchId, payload)` | Enregistre un véhicule (ou un statut "Je m'y rends seul"). |
| `ctrlUpdateVehicle(matchId, rideId, playerName, payload)` | Met à jour les places d'un véhicule. |
| `ctrlDeleteVehicle(matchId, rideId, playerName, adminToken)` | Supprime un véhicule avec bascule des passagers en attente. |
| `ctrlJoinRide(matchId, rideId, playerName, direction)` | Ajoute un passager dans un véhicule (avec contrôles de capacité et cohérence liste d'attente). |
| `ctrlLeaveRide(matchId, rideId, playerName, direction)` | Retire un passager d'un véhicule. |
| `ctrlJoinWaitingList(matchId, playerName, needsOutward, needsReturn)` | Inscription en recherche de place. |
| `ctrlLeaveWaitingList(matchId, waitingId, playerName, adminToken)` | Retrait de la liste d'attente. |

### `Database.gs` (ORM Google Sheets)
| Fonction | Description |
| :--- | :--- |
| `initDatabase()` / `syncSheetHeaders()` | Initialisation et auto-migration des feuilles `CONFIG`, `MATCHES`, `RIDES`, `WAITING_LIST`. |
| `getTableRecords(sheetName)` | Récupère tous les enregistrements d'une feuille sous forme d'objets. |
| `insertRecord(sheetName, record)` | Insère une nouvelle ligne dans une feuille. |
| `updateRecord(sheetName, id, updates)` | Met à jour une ligne par son identifiant. |
| `deleteRecord(sheetName, id)` / `deleteRecordsWhere()` | Suppression d'enregistrements. |
| `getConfigValue(key)` / `setConfigValue(key, value)` | Lecture/écriture de paramètres clés-valeurs. |

### `Utils.gs` (Utilitaires Serveur)
| Fonction | Description |
| :--- | :--- |
| `withScriptLock(callback, timeoutMs)` | Exécute un bloc critique sous verrouillage concurrentiel `LockService`. |
| `generateId(prefix)` | Génère un identifiant unique horodaté. |
| `formatWhatsAppSummary(match, rides, waitingList, publicUrl)` | Formate le message récapitulatif WhatsApp. |
| `responseSuccess(data)` / `responseError(message)` | Formate les réponses `{ success, data, error }`. |
