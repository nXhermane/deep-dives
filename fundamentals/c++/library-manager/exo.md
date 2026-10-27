## Système de Gestion de Bibliothèque Moderne

**Contexte :**
Vous devez créer un système de gestion pour une bibliothèque municipale qui souhaite moderniser son système. Le système doit gérer les livres, les emprunts, les réservations et les avis des lecteurs.

**Fonctionnalités de Base (Niveau 1) :**
1. Gestion des Livres
   - Ajouter/supprimer des livres
   - Chaque livre a : ISBN, titre, auteur, année de publication
   - Marquer un livre comme disponible/emprunté
   - Rechercher des livres par différents critères (ISBN, auteur, titre)

2. Système d'Avis
   - Les lecteurs peuvent laisser des avis (1-5 étoiles + commentaire)
   - Calcul de la note moyenne des livres
   - Stockage de la date de l'avis

**Fonctionnalités Avancées (Niveau 2) :**
1. Système de Réservation
   - File d'attente pour les livres populaires
   - Notification quand un livre devient disponible
   - Limite de temps pour récupérer un livre réservé

2. Catégorisation
   - Ajouter des genres/tags aux livres
   - Système de recherche par catégorie
   - Suggestions de livres similaires

3. Gestion des Utilisateurs
   - Création de comptes utilisateurs
   - Historique des emprunts
   - Système de limitation d'emprunts
   - Gestion des retards et pénalités

**Contraintes Techniques :**
1. Utiliser la gestion moderne de la mémoire (smart pointers)
2. Implémenter une gestion d'erreurs robuste avec des exceptions
3. Utiliser les conteneurs de la STL (vector, unordered_map, etc.)
4. Implémenter des méthodes de recherche flexibles avec des prédicats

**Interface Utilisateur :**
1. Menu console interactif permettant de :
   - Gérer les livres (CRUD)
   - Effectuer des recherches
   - Gérer les emprunts et réservations
   - Consulter et ajouter des avis

**Bonus (Niveau 3) :**
1. Persistance des données
   - Sauvegarde/chargement de l'état du système
   - Export des statistiques
2. Système de recommandation
   - Basé sur l'historique de lecture
   - Basé sur les notes des utilisateurs
3. Interface graphique simple
4. Tests unitaires

