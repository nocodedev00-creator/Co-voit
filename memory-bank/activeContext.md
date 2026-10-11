# Contexte Actif

## Travail Réalisé & Validé
1. **Option Admin : Répartition Nominative vs Comptage Simple** :
   - Ajout d'une option lors de la création d'un match (`has_car_assignment`, cochée par défaut).
   - Mode activé (défaut) : fonctionnement classique avec réservation de place par véhicule (`+ Monter à l'Aller / Retour`) et détail des passagers.
   - Mode désactivé (comptage simple) : les boutons d'inscription dans un véhicule sont masqués sur les cartes de voitures. L'interface affiche uniquement les véhicules avec leurs capacités et la liste des personnes à véhiculer, tout en calculant le solde et les bilans A/R.
   - Sécurisation côté serveur dans `ctrlJoinRide` (rejet de réservation si le match est en comptage simple).
   - Adaptation automatique de la synthèse WhatsApp pour ce mode.
   - Badge visuel sur le tableau de bord Admin (`Répartition A/R` ou `Comptage simple`).

2. **Déploiement Clasp Validé en Production** :
   - Fichiers Google Apps Script synchronisés via `clasp push`.
   - Version @37 redéployée avec succès sur le déploiement de production.

3. **Architecture & Refactoring Watchdog** :
   - Tous les modules JS restent strictement sous la limite de 300 lignes (max: 249 lignes).
