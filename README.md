# 🚗 Co'Voit' — Guide d'Administration & Fonctionnement

Application web mobile-first de covoiturage événementiel pour clubs sportifs et associations.

---

## 🌟 1. Comment fonctionne l'application aujourd'hui ?

L'application utilise une **architecture découplée** pour garantir une ouverture instantanée sur smartphone et **supprimer définitivement les blocages Google Drive / multi-comptes** :

```mermaid
flowchart TD
    subgraph 📱 Utilisateurs
        A["👤 Joueurs (Lien WhatsApp)"]
        B["👑 Coach / Admin (Lien Secret)"]
    end

    subgraph 🌐 GitHub Pages (Hébergement Statique Gratuit)
        C["Site Web Rapide & Autonome<br/>https://nocodedev00-creator.github.io/Co-voit/"]
    end

    subgraph ⚙️ Google Cloud (Votre Compte)
        D["API Google Apps Script (Code.gs)"]
        E["Base de Données Google Sheets<br/>(CONFIG, MATCHES, RIDES, WAITING_LIST)"]
    end

    A -->|1. Clic direct sans compte requis| C
    B -->|1. Accès sécurisé via token| C
    C -->|2. Requêtes fetch() transparentes| D
    D -->|3. Lecture / Écriture sécurisée| E
    D -->|4. Réponse JSON instantanée| C
```

1. **Le site web (Interface)** est hébergé gratuitement sur **GitHub Pages**. Il s'affiche en moins d'une seconde sur n'importe quel smartphone, sans demander d'identifiant Google.
2. **La base de données** reste votre **classeur Google Sheets**, où vous pouvez consulter toutes les données en direct.
3. **Le moteur (API)** est votre script **Google Apps Script**, qui reçoit les inscriptions et met à jour le tableau en arrière-plan.

---

## 👑 2. Guide d'Utilisation pour l'Administrateur (Coach)

### A. Où trouver votre clé secrète (`ADMIN_TOKEN`) ?
1. Ouvrez votre classeur Google Sheets lié au projet.
2. Rendez-vous dans l'onglet **`CONFIG`**.
3. Repérez la ligne **`ADMIN_TOKEN`** : la valeur à droite est votre clé secrète (ex: `A1B2C3D4E5F6`).

---

### B. Accéder au Tableau de Bord Coach
Pour administrer vos rencontres, ouvrez l'adresse suivante dans votre navigateur (sur PC ou smartphone) :
👉 **`https://nocodedev00-creator.github.io/Co-voit/?admin=VOTRE_TOKEN_ADMIN`**

*(Astuce : ajoutez cette page aux favoris de votre téléphone pour y accéder en 1 clic).*

---

### C. Gérer une rencontre étape par étape

1. **Créer un match :**
   - Cliquez sur **+ Créer un nouveau match**.
   - Renseignez l'intitulé (ex: *Déplacement vs US Créteil*), la date, l'heure du RDV et le lieu de départ.
   - Cliquez sur **Enregistrer**.

2. **Partager aux joueurs :**
   - **Option 1 (Message complet WhatsApp) :** Cliquez sur le bouton **💬 WhatsApp** du match. Le texte récapitulatif est généré automatiquement avec la liste des conducteurs, passagers, places restantes et le lien d'inscription direct. Cliquez sur **Copier dans le presse-papier** et collez dans votre groupe WhatsApp.
   - **Option 2 (Lien seul) :** Cliquez sur **🔗 Lien joueur** pour copier l'adresse directe du match (ex: `https://nocodedev00-creator.github.io/Co-voit/?m=m_123abc`).

3. **Suivre l'équilibre des places :**
   - La carte du match affiche en temps réel :
     - Le nombre de véhicules déclarés.
     - Le ratio de places disponibles Aller / Retour.
     - Le nombre de joueurs encore sans place.

4. **Verrouiller les inscriptions :**
   - La veille du match ou quand l'organisation est fixée, cliquez sur **🔒 Verrouiller**. Les joueurs pourront toujours consulter l'organisation mais ne pourront plus modifier leurs choix.

5. **Supprimer un match :**
   - Cliquez sur **🗑️ Supprimer le match** pour effacer la rencontre et libérer les inscriptions associées.

---

## 👥 3. Ce que voient les Joueurs

Quand un joueur clique sur le lien WhatsApp (`?m=ID_DU_MATCH`) :
1. **Zéro connexion requise :** Le site s'ouvre directement.
2. **Identification simple :** Lors de sa première action (proposer un véhicule ou réserver une place), l'application lui demande simplement son **Prénom**, qu'elle mémorise sur son téléphone.
3. **3 choix simples :**
   - **🚗 Je conduis :** Il indique le nombre de places offertes pour l'Aller et le Retour (indépendantes).
   - **🙋 Je cherche :** Il s'inscrit sur la liste d'attente s'il a besoin d'une place.
   - **📍 Je m'y rends seul :** Il prévient l'équipe qu'il va directement sur place par ses propres moyens.
4. **Montée en voiture en 1 clic :** Les joueurs cliquent sur **+ Monter à l'Aller** ou **+ Monter au Retour** dans le véhicule de leur choix.

---

## 🛠️ 4. Maintenance & Mises à Jour

### Si vous modifiez l'interface (Design, textes, boutons) :
Tous les fichiers du site web sont sur votre ordinateur :
- [index.html](file:///d:/OneDrive/Code/Co%20voit/index.html) : structure de la page.
- [styles.css](file:///d:/OneDrive/Code/Co%20voit/styles.css) : mise en page et couleurs.
- Dossier [js/](file:///d:/OneDrive/Code/Co%20voit/js/) : logique de l'application.

Pour publier une mise à jour sur le site en ligne, ouvrez un terminal dans ce dossier et tapez :
```bash
git add .
git commit -m "Mise à jour du design"
git push origin main
```
*GitHub Pages met à jour le site automatiquement en 30 secondes.*

---

### Si vous modifiez le script Google Apps Script :
Si vous modifiez [Code.gs](file:///d:/OneDrive/Code/Co%20voit/Code.gs) ou les fichiers `.gs` :
1. Copiez les modifications dans votre éditeur Google Apps Script.
2. Cliquez sur **Déployer > Gérer les déploiements**.
3. Cliquez sur le **crayon (Modifier)**, sélectionnez **Version : Nouvelle version**, puis validez.
4. Si l'URL changeait (ce qui est rare), mettez simplement à jour [js/config.js](file:///d:/OneDrive/Code/Co%20voit/js/config.js) et faites un `git push`.

---

## 📁 5. Arborescence du Projet

```
Co-voit/
├── README.md                # Le présent guide d'administration
├── index.html               # Page d'accueil mobile-first servie par GitHub Pages
├── styles.css               # Styles et animations de l'interface
├── js/                      # Modules JavaScript (< 300 lignes par fichier)
│   ├── config.js            # URL de liaison avec l'API Google Apps Script
│   ├── state.js             # Gestion du routage (?admin=... et ?m=...)
│   ├── api.js               # Passerelle réseau fetch()
│   ├── ui-utils.js          # Boîtes de dialogue, toasts et gestion de l'identité
│   ├── ui-match-summary.js  # Calculs des places A/R et modale de synthèse
│   ├── ui-match-cards.js    # Rendu des cartes véhicules et pastilles
│   ├── ui-match-render.js   # Orchestration de la vue match
│   ├── ui-match-actions.js  # Actions d'inscription / désinscription
│   ├── ui-admin.js          # Tableau de bord Coach
│   └── app.js               # Initialisation de l'application
├── Code.gs                  # Routeur API REST Google Apps Script
├── Controllers.gs           # Logique métier et autorisations
├── Database.gs              # Couche d'accès aux données Google Sheets
└── Utils.gs                 # Formatage des dates et messages WhatsApp
```

