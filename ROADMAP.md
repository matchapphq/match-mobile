# 🗺️ Match Mobile Roadmap

Ce document définit les étapes clés pour faire évoluer l'application Match de la version **0.9.0** vers la version **1.0.0**.

---

## 🎯 Version 0.9.1 : Polissage & Robustesse (UX/UI)
*Objectif : Améliorer le ressenti utilisateur et stabiliser les parcours existants.*

### 🎨 Expérience Utilisateur (UX)
- [x] **Skeleton Screens** : Remplacer les indicateurs de chargement circulaires par des chargements fantômes sur la liste des bars et la recherche.
- [x] **Haptic Feedback** : Ajouter des micro-vibrations (Expo Haptics) sur les actions clés : validation de réservation, ajout aux favoris, et erreurs de formulaire.
- [x] **Empty States Illustrés** : Améliorer les écrans "Aucun résultat" avec des visuels plus engageants.

### 🛠️ Stabilité Technique
- [x] **Gestion du Mode Hors-ligne** : Afficher une bannière de déconnexion et permettre la consultation des bars mis en cache via `AsyncStorage`.
- [x] **Deep Linking** : Configurer les schémas d'URL (`matchapp://`) pour ouvrir l'app directement sur un bar ou un match spécifique.
- [x] **Optimisation Image** : Utiliser `expo-image` for a better cache and smooth transitions on venue photos.

### 📢 Partage
- [ ] **Partage Social** : Bouton de partage sur les fiches bars/matchs générant un lien propre et un texte d'invitation.

---

## 🚀 Version 0.9.5 : Fonctionnalités Majeures
*Objectif : Activer les leviers de rétention et les services à haute valeur ajoutée.*

### ⚽ Live & Engagement
- [ ] **Scores en Temps Réel** : Intégration des scores en direct dans l'onglet Matchs (via API Sports).
- [ ] **Système d'Avis Réels** : Permettre l'envoi de notes et photos après une réservation (UI déjà prête dans `VenueReviewsScreen`).
- [ ] **Filtres Avancés** : Filtrage par "Son activé", "Terrasse avec TV", ou "Pinte à < 6€".

### 💳 Monétisation & Fidélité
- [ ] **Paiement Stripe (Caution)** : Implémenter le blocage de caution de 10€ pour les groupes de plus de 8 personnes.
- [ ] **Portefeuille & Coupons** : Rendre fonctionnelle la section "Mon Portefeuille" et permettre l'application de codes promos lors de la réservation.
- [ ] **Geofencing Check-in** : Valider automatiquement une réservation quand l'utilisateur arrive au bar pour lui attribuer des points de fidélité.

### 🔔 Intelligence Notifications
- [ ] **Push Contextuelles** : Rappel automatique 1h avant le coup d'envoi pour les réservations confirmées.
- [ ] **Alertes Matchs** : Notification lorsqu'un bar favori annonce la diffusion d'un match d'une équipe suivie.

---

## ✅ Version 1.0.0 : Launch Ready
- [ ] Migration totale vers les données de production (suppression des mocks restants).
- [ ] Analytics complet (PostHog) sur tout le tunnel de conversion.
- [ ] Internationalisation (Anglais/Espagnol) via `i18next`.
- [ ] Publication sur l'App Store et Google Play Store.
