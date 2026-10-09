# Journal des Décisions Techniques & Résolutions

Ce document trace l'historique condensé des décisions d'architecture et résolutions critiques.

## 2026-09-21 : Architecture Fondatrice & Ergonomie Initiale
- **Trajets A/R indépendants** : Offres et demandes de places gérées séparément à l'Aller et au Retour.
- **Codes couleur distincts** : Aller = Bleu, Retour = Orange (repères visuels unifiés sur toute l'interface).
- **Cartes véhicules 2 colonnes** : Disposition côte à côte (Aller gauche / Retour droite) via flexbox robuste.

## 2026-09-26 : Migration Découplée & Fix Heure Google Sheets
- **Découplage Front/Back** : Front statique autonome sur GitHub Pages + Back API REST JSON Google Apps Script (`fetch` format `text/plain` anti-CORS). Résout 100% des erreurs d'authentification et de multi-comptes sur mobile.
- **Fix heure 00:09** : Parsing explicite `HH:mm` pour contourner le fuseau horaire 1899 des dates de Google Sheets.
- **Accueil Coach** : Authentification directe par saisie `ADMIN_TOKEN` sur la page d'accueil.

## 2026-09-27 : Clasp Automatisé & Verdict Scindé
- **Google Clasp v3.3.0** : Configuration `.clasp.json` et `.claspignore` (seuls les 4 `.gs` et `appsscript.json` sont synchronisés). Déploiements CLI directs sans copier-coller.
- **Bilan Global scindé** : `#global-balance-verdict` divisé en 2 colonnes `#verdict-outward` et `#verdict-return` pour uniformiser l'affichage avec les véhicules.
- **Philosophie Parking** : Inscription simplifiée "Je cherche une place" sans affectation obligatoire immédiate d'un véhicule.

## 2026-10-09 : Gestion des Accompagnateurs (Non Véhiculés)
- **Modèle de données** : Ajout automatique de la colonne `extra_passengers` dans `WAITING_LIST` via `syncSheetHeaders()`.
- **Calculs de solde réels** : Prise en compte du groupe (`1 + extra_passengers`) dans les places demandées, les soldes et les pastilles de synthèse.
- **Réservation solidaire** : Capacité vérifiée pour le groupe lors du choix "+ Monter", réservation et désistement synchronisés.
