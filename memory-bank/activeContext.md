# Contexte Actif

## Travail en Cours
Analyse initiale du projet **Co'Voit** et remplissage de la Memory Bank.

Le projet est une Web App Google Apps Script de covoiturage événementiel.
**État critique** : seul `ClientJS.html` (couche client SPA, 1110 lignes) est implémenté.
Tous les fichiers serveur (`Code.gs`, `Controllers.gs`, `Database.gs`, `Utils.gs`) et les vues HTML (`Index.html`, `AdminView.html`, `MatchView.html`, `Styles.html`) sont **vides (0 octet)**.

## Objectifs de la Session
1. ✅ Analyser les fichiers existants.
2. ✅ Remplir la Memory Bank (brief, tech, patterns, functionMap, progress).
3. ⏭️ **Prochaine étape probable** : implémenter le backend (`Code.gs`, `Controllers.gs`, `Database.gs`, `Utils.gs`) et les vues HTML pour rendre l'app fonctionnelle.

## État de la Mémoire
- **Architecture** : Définie dans `systemPatterns.md` (SPA Apps Script + pont RPC `google.script.run`).
- **Stack** : Définie dans `techContext.md` (Apps Script V8, Google Sheets, Tailwind).
- **Contrat d'API** : Les 13 méthodes `ctrl*` attendues par le client sont documentées dans `systemPatterns.md`.

## Points d'Attention
- Le client attend un objet `window.SERVER_ROUTING` injecté par le serveur (`doGet`).
- Le contrat de retour serveur est `{ success: boolean, data?, error? }`.
- Les places Aller et Retour sont **indépendantes** (règle métier centrale).
- L'accès admin est protégé par `adminToken`.
