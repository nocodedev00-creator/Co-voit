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
