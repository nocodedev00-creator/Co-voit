# État d'Avancement du Projet

## Statut Global
🚀 **Migration vers GitHub Pages & Architecture Découplée Réalisée**
Le site est prêt pour GitHub Pages avec séparation Front statique et Back API Google Apps Script. Les plantages multi-comptes sur mobile sont éliminés.

## Ce qui fonctionne
- ✅ **Front-end statique autonome** (`index.html`, `styles.css`) : entièrement autonome, intégration complète des vues Joueur et Coach.
- ✅ **Modules JavaScript ES6** (`js/`) : architecture découpée, propre et modulaire, tous les fichiers < 300 lignes.
- ✅ **Passerelle réseau REST** (`js/api.js`) : communication par requêtes `fetch()` POST vers Google Apps Script sans blocage CORS.
- ✅ **Routeur API Google Apps Script** (`Code.gs`) : `doPost(e)` et `doGet(e)` répondant en JSON pur avec `ContentService`.
- ✅ **Métier & Données** (`Controllers.gs`, `Database.gs`, `Utils.gs`) : intacts et réutilisés, persistance Google Sheets préservée.
- ✅ **Gestion Git & Versioning** : `.gitignore` configuré, renommage `Index.html` en `index.html` validé.

## Prochaines Étapes pour la mise en ligne
1. **Dans Google Apps Script** : Copier le nouveau code de `Code.gs` et publier une nouvelle version du déploiement Web App (`Gérer les déploiements > Modifier > Nouvelle version`).
2. **Dans `js/config.js`** : Coller l'URL de déploiement de la Web App (`https://script.google.com/macros/s/.../exec`).
3. **Dans GitHub** : Pousser les modifications sur la branche `main` et activer **GitHub Pages** (`Settings > Pages > Branch main`).
4. **Tester** : Vérifier l'accès admin (`?admin=...`) et joueur (`?m=...`) depuis un smartphone avec plusieurs comptes Google.
