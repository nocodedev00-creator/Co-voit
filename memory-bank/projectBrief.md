# Co'Voit - Brief & Vision

## Vision du Projet
Co'Voit est une application web de **covoiturage événementiel** conçue pour organiser les déplacements d'un groupe (typiquement une équipe sportive) vers un match ou un événement.

L'objectif est de créer une application **Web (Google Apps Script Web App)** capable de centraliser l'organisation des trajets Aller/Retour, avec une attention particulière portée à la **simplicité d'usage mobile** et à la **clarté de la synthèse** (qui conduit, qui a une place, qui en cherche).

## Objectifs Principaux
1. **Centraliser les inscriptions** : Permettre aux joueurs de proposer un véhicule ou de demander une place (Aller et/ou Retour).
2. **Visualiser l'équilibre** : Afficher en temps réel le solde de places (offres vs demandes) par sens de trajet.
3. **Faciliter la communication** : Générer une synthèse copiable pour WhatsApp et partager un lien direct par match.

## Fonctionnalités Clés

### 1. Vue Joueur (Match)
- **Proposer un véhicule** : Conducteur avec places Aller / Retour indépendantes, option "Direct sur place".
- **Rejoindre un véhicule** : S'inscrire comme passager Aller et/ou Retour (places indépendantes).
- **Liste d'attente** : S'inscrire en recherche de place (Aller / Retour / les deux).
- **Synthèse détaillée** : Modale listant les joueurs au RDV vs en direct, par sens.
- **Identité locale** : Nom mémorisé via `localStorage`.

### 2. Vue Admin
- **Créer un match** : Titre, date, heure de départ, lieu de RDV.
- **Gérer les matchs** : Verrouiller/déverrouiller, supprimer, voir comme joueur.
- **Partage** : Copier le lien joueur, générer la synthèse WhatsApp.
- **Statistiques** : Nombre de voitures, places A/R, joueurs sans place.

## Stack Technique (Prévisionnelle)
- **Langage** : JavaScript (V8) côté serveur (Google Apps Script) + HTML/CSS/JS côté client.
- **Interface** : SPA HTML avec Tailwind CSS (classes utilitaires).
- **Données** : Google Sheets (via `SpreadsheetApp`).
- **Services Externes** : Google Apps Script Web App, `google.script.run` pour la communication client/serveur.
