# Contexte Actif

## Travail Réalisé & Validé
1. **Édition des Matchs en Direct (Mode Admin)** :
   - Ajout d'un bouton `✏️ Modifier` sur chaque carte de match du tableau de bord Admin.
   - Nouvelle modale `modal-edit-match` pré-remplie avec le titre, la date, l'heure de RDV, le lieu et l'option de répartition.
   - Nouveau endpoint `ctrlUpdateMatch(adminToken, matchId, payload)` dans `Controllers.gs` et `Code.gs`.

2. **Option Admin : Répartition Nominative vs Comptage Simple** :
   - Option à la création (`modal-create-match`) et à l'édition (`modal-edit-match`).
   - Interface allégée : suppression du bouton de bascule rapide encombrant sur la carte (modification centralisée dans `Modifier`).
   - Disposition en grille 2 colonnes équilibrée : `Modifier` + `Voir`, `Lien joueur` + `WhatsApp`, `Verrouiller` + `Supprimer`.
   - Mode comptage simple : cartes de voitures allégées sans réservation nominative, solde et liste des joueurs à véhiculer préservés.

3. **Déploiement Clasp Validé en Production** :
   - Synchronisation et déploiement de production version @39.
   - Tous les modules JS restent strictement sous la limite de 300 lignes (max: 270 lignes dans `app.js`).
