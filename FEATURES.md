# Match Mobile - Nouvelles fonctionnalités (depuis la version 0.9.5)

Ce document résume les principales fonctionnalités et améliorations mises en place dans l’application Match Mobile depuis le commit `10bce1ee5d241931581c1e45e0f06be2c85cfa2b`.

---

## ⭐️ Grandes refontes (édition 2026)

### 🏨 Expérience lieu moderne
- **Refonte de la fiche lieu** : Mise en place d’une interface « 2026 » avec visuel principal scindé, carte d’infos en verre dépoli flottante et bouton collant « Réserver une table » qui apparaît au scroll.
- **Hiérarchie visuelle** : Hiérarchie revue en s’inspirant d’apps grand public haut de gamme (Uber, Apple Maps), avec une typo plus affirmée et beaucoup d’espace blanc.
- **Hub d’actions rapides** : Barre d’actions en 3 colonnes pour accéder en un geste aux matchs, à l’itinéraire et à l’appel téléphonique.

### 📅 Parcours de réservation nouvelle génération
- **Onboarding guidé** : Remplacement de l’ancien formulaire long par un assistant en 4 étapes :
    1. **Date & heure** : Carrousel horizontal avec heures d’arrivée recommandées.
    2. **Sélection du match** : Liste des diffusions, filtrable et recherchable.
    3. **Invités & options** : Compteur minimaliste et champ de demandes spéciales.
    4. **Confirmation** : Carte récapitulative haute fidélité avant validation finale.
- **Validation renforcée** : L’utilisateur doit désormais choisir un match précis pour continuer, ce qui améliore la qualité des réservations.
- **Dates sûres en fuseau horaire** : Gestion des dates réécrite pour éviter les décalages d’un jour entre fuseaux horaires.

---

## ⚽️ Fonctionnalités matchs & découverte

### 🔍 Recherche et filtres améliorés
- **Filtrage dynamique des lieux** : Depuis la fiche d’un match, l’utilisateur peut filtrer les lieux par distance (ex. < 1 km), ambiance ou possibilité de réservation.
- **Timeline agenda** : Vue « Tous les matchs » repensée en frise chronologique groupée par date pour mieux planifier à l’avance.
- **Filtres par sport** : Ajout de pastilles flottantes horizontales pour filtrer par sport (Football, Rugby, etc.) sur plusieurs écrans.

### 🏆 Équipes & compétitions
- **Hub de découverte des équipes** : Nouvelles vues dédiées à la configuration des équipes favorites et à l’exploration des détails par équipe.
- **Compétitions populaires** : Nouvelle section de découverte mettant en avant les tournois majeurs avec un carrousel horizontal.
- **Fonction « Suivre »** : Intégration temps réel pour suivre / ne plus suivre équipes et ligues directement depuis les écrans de découverte.

---

## 🗺️ Améliorations carte & UX

### 📍 Expérience carte plus intelligente
- **Thème dynamique** : La carte et ses popups sont désormais entièrement sensibles au thème, avec un mode Sombre (Vert lime) et un mode Clair (Violet) parfaitement gérés.
- **Intégration des itinéraires** : Deep-link avec **Apple Maps** (iOS) et **Google Maps** (Android) pour lancer la navigation en un tap.
- **Rafraîchissement de zone** : Bouton « Rechercher dans cette zone » qui réapparaît à chaque mouvement de carte, avec états de chargement et de « aucun résultat » clairs.

### ✍️ Social & avis
- **Système d’avis avancé** : Possibilité de laisser des avis avec note, tags spécifiques (ex. « Écrans géants ») et plusieurs photos.
- **Interaction avec les avis** : Bouton « Utile » sur les avis et graphique de répartition des notes directement sur la fiche lieu.

---

## 🛠 Technique & performance
- **Moteur haptique** : Intégration de `expo-haptics` dans toute l’app pour un retour tactile lors des sélections, succès et erreurs.
- **Optimisations de performance** : Utilisation intensive de `useMemo` et `useCallback` pour des interactions carte et des listes ultra fluides.
- **Écrans squelettes** : Généralisation des états de chargement squelettes sur les nouveaux écrans pour améliorer la perception de performance.
- **Analytics anonymisés** : Intégration de PostHog avec identifiants hachés pour rester conforme au RGPD tout en conservant des données d’usage de haute qualité.
