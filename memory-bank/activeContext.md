# Contexte Actif

## Travail Réalisé & Validé
1. **Gestion des Accompagnateurs (Non Véhiculés) Opérationnelle** :
   - Formulaire "Je cherche une place" enrichi d'un sélecteur d'accompagnants (0 à 3 accompagnateurs supplémentaires).
   - Schéma `WAITING_LIST` complété avec `extra_passengers` (auto-migration via `syncSheetHeaders()`).
   - Calculs logistiques réels : les accompagnateurs sont décomptés fidèlement dans les soldes de places et les totaux au RDV.
   - Réservation solidaire : vérification de la capacité globale du véhicule lors du choix "+ Monter", réservation et désistement synchronisés pour tout le groupe.
   - Affichage visuel clair : pastilles d'attente `Prénom +X (Aller-Ret)`, récapitulatif détaillé `Prénom (+X pers.)`, et export WhatsApp avec mention `(+X)`.

2. **Architecture & Refactoring Watchdog** :
   - Fichiers JS strictement sous la barre des 300 lignes : `app.js` allégé à 241 lignes grâce au transfert des gestionnaires de formulaires dans `ui-match-actions.js` (194 lignes). `ui-match-summary.js` maintenu à 288 lignes.
   - Nettoyage de `decisionLog.md` (< 50 lignes) et actualisation de `projectBrief.md` & `functionMap.md`.

3. **Déploiement Automatisé Clasp & GitHub Pages** :
   - Synchronisation `npx @google/clasp push -f` validée (5 fichiers backend).
   - Déploiement en production exécuté via `npx @google/clasp deploy` (**version @31** active).
   - Cache buster mis à jour en `?v=20261009_1` sur `index.html`.
