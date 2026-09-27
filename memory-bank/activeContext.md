# Contexte Actif

## Travail Réalisé & Validé
1. **Migration Découplée Réussie & Opérationnelle** :
   - Front-end statique autonome sur GitHub Pages (`https://nocodedev00-creator.github.io/Co-voit/`).
   - Back-end Google Apps Script en mode API REST JSON.
   - Refonte UI match : masquage de `#match-actions-container` une fois inscrit, restriction stricte de réservation de véhicules aux seuls inscrits "Je cherche", et calcul indépendant du bilan A/R.

2. **Synchronisation Automatique Google Apps Script via Clasp (100% Opérationnelle)** :
   - **Authentification** : Compte propriétaire `no.code.dev.00@gmail.com` connecté et validé dans Clasp.
   - **Configuration** : Fichier `.clasp.json` lié au script Google Sheets (`1yyBMcI-Hznjg-V8FL3hp_EtZgCJNfNH06cvhUz5WSkL6pSyB3F5s4Yly`).
   - **Filtrage Strict** : Fichier `.claspignore` configuré et vérifié (seuls les 4 fichiers `.gs` et `appsscript.json` sont envoyés à Google, les fichiers web GitHub Pages sont ignorés).
   - **Sécurité** : `.gitignore` protège `.clasp.json` et `.clasprc.json`.
   - **Validation en Production** : Commande `npx @google/clasp push -f` exécutée avec succès (5 fichiers synchronisés en direct sur Google Apps Script).
   - **Règle Système** : Gravée dans `systemPatterns.md` : tout agent ou développeur doit exécuter systématiquement `npx @google/clasp push` dès qu'un fichier `.gs` ou le manifest est modifié.

## Rappel pour le Déploiement Web App
- Le code source dans l'éditeur Google Apps Script est maintenant synchronisé en temps réel.
- Si une mise à jour d'un `.gs` modifie le comportement de la Web App en production, penser à mettre à jour la version du déploiement (soit via `clasp deploy`, soit via l'interface Google Apps Script : *Déployer > Gérer les déploiements > Modifier > Nouvelle version*).
