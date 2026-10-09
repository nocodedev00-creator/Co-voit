# Contexte Actif

## Travail Réalisé & Validé
1. **Bouton d'Identité Joueur Intégré dans l'En-tête** :
   - Remplacement du bouton d'actualisation (#btn-player-refresh) par le bouton (#btn-player-change-user) affichant directement le prénom de l'utilisateur (`👤 Romain` ou `👤 Changer`).
   - Clic direct sur le bouton ouvre la modale de changement de prénom avec autofocus immédiat.

2. **Gestion des Accompagnateurs & Calculs de Solde 100% Opérationnels** :
   - Formulaire "Je cherche une place" avec sélecteur d'accompagnants (0 à 3).
   - Formule de solde corrigée et fiabilisée séparant les participants uniques des demandes de places supplémentaires.
   - Modale détaillée et export WhatsApp affichant clairement les mentions `(+X pers.)`.

3. **Architecture & Refactoring Watchdog** :
   - Tous les modules JS restent strictement sous la limite de 300 lignes (max: 294 lignes dans `ui-match-summary.js`).
   - Déploiement GitHub Pages poussé avec cache buster `?v=20261009_3`.
