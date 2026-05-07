# GitHub Activity CLI

Une interface de ligne de commande (CLI) simple pour récupérer et afficher l'activité récente d'un utilisateur GitHub directement dans votre terminal.

## Description

Ce projet consiste en une application CLI qui permet de récupérer les événements publics récents d'un utilisateur GitHub via l'API officielle de GitHub. Elle illustre des concepts clés tels que l'utilisation des API web, la manipulation de données JSON et la création d'interfaces en ligne de commande.

## Fonctionnalités

*   Récupère l'activité récente d'un utilisateur GitHub spécifié.
*   Affiche une liste claire des dernières actions (événements) dans le terminal.
*   Gère les erreurs (par exemple, utilisateur non trouvé).

## Exigences

*   Langage de programmation (ex. : Python, Node.js, Go, Rust, etc.) capable de faire des requêtes HTTP et de traiter du JSON.
*   Accès à la ligne de commande.

## Utilisation

1.  Exécutez l'application en lui fournissant le nom d'utilisateur GitHub comme argument.

    ```bash
    github-activity <username>
    ```

    Exemple:

    ```bash
    github-activity kamranahmedse
    ```

2.  L'application récupérera les événements récents de l'utilisateur `kamranahmedse` via l'API GitHub (`https://api.github.com/users/kamranahmedse/events`).

3.  L'activité sera formatée et affichée dans le terminal, par exemple :

    ```
    - Pushed 3 commits to kamranahmedse/developer-roadmap
    - Opened a new issue in kamranahmedse/developer-roadmap
    - Starred kamranahmedse/developer-roadmap
    - ...
    ```

## Implémentation

*   L'application doit être construite sans utiliser de bibliothèque ou framework externe pour la récupération directe des données GitHub. Utilisez les bibliothèques natives du langage choisi pour effectuer les requêtes HTTP et parser le JSON.
*   Le point de terminaison API utilisé est : `https://api.github.com/users/{username}/events`
*   Assurez-vous de gérer correctement les erreurs potentielles, comme une absence de réponse du serveur ou un nom d'utilisateur inexistant.

## Améliorations Possibles

*   **Filtrage** : Permettre de filtrer les événements par type (PushEvent, IssueEvent, etc.).
*   **Format d'affichage** : Proposer des formats d'affichage alternatifs (JSON brut, format plus détaillé, etc.).
*   **Historique** : Ajouter la possibilité de spécifier le nombre d'événements à récupérer.
*   **Mise en cache** : Mettre en cache les résultats pour éviter de surcharger l'API lors de requêtes successives rapprochées.

---
[ROADMAP SH PROJECT: https://roadmap.sh/projects/github-user-activity](https://roadmap.sh/projects/github-user-activity)