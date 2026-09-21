# État d'Avancement du Projet

## Statut Global
🟡 **En cours d'initialisation** — La couche client est prête, le backend et les vues HTML restent à implémenter.

## Ce qui fonctionne
- ✅ **Couche client SPA** (`ClientJS.html`) : état global, rendu des vues match/admin, gestion des modales, appels serveur, synthèse de places, identité joueur.
- ✅ **Manifeste de déploiement** (`appscript.json`) : config Web App, scopes OAuth, timezone.

## Ce qui reste à faire
- ❌ **`Code.gs`** : `doGet(e)`, routage (`ADMIN`/`MATCH`/`NO_ACCESS`), injection `SERVER_ROUTING`.
- ❌ **`Controllers.gs`** : les 13 méthodes `ctrl*` attendues par le client.
- ❌ **`Database.gs`** : accès Google Sheets (matchs, rides, waiting list).
- ❌ **`Utils.gs`** : helpers serveur (validation, sécurité token, formatage).
- ❌ **`Index.html`** : shell HTML de la SPA (conteneurs de vues, modales, `toast-container`).
- ❌ **`AdminView.html`** : vue admin (liste matchs, modales création/WhatsApp).
- ❌ **`MatchView.html`** : vue joueur (détails match, véhicules, liste d'attente, modales).
- ❌ **`Styles.html`** : styles CSS (Tailwind + animations `toast-enter`, `btn-tap`).

## Détail des fichiers
| Fichier | Taille | Statut |
| :--- | :--- | :--- |
| `ClientJS.html` | 47 980 o | ✅ Implémenté |
| `appscript.json` | 390 o | ✅ Configuré |
| `Code.gs` | 0 o | ❌ Vide |
| `Controllers.gs` | 0 o | ❌ Vide |
| `Database.gs` | 0 o | ❌ Vide |
| `Utils.gs` | 0 o | ❌ Vide |
| `Index.html` | 0 o | ❌ Vide |
| `AdminView.html` | 0 o | ❌ Vide |
| `MatchView.html` | 0 o | ❌ Vide |
| `Styles.html` | 0 o | ❌ Vide |

## Prochaines Étapes Recommandées
1. Implémenter `Database.gs` (schéma Sheets : Matchs, Rides, Waiting).
2. Implémenter `Utils.gs` (helpers + validation token).
3. Implémenter `Controllers.gs` (API `ctrl*`).
4. Implémenter `Code.gs` (`doGet` + routage + injection `SERVER_ROUTING`).
5. Implémenter les vues HTML (`Index.html`, `AdminView.html`, `MatchView.html`, `Styles.html`) avec les IDs attendus par `ClientJS.html`.
