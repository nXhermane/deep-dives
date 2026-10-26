# Projet pratique Rust — KEEP Vault

## 1\. Contexte

Tu dois développer une bibliothèque Rust permettant de gérer un coffre-fort de secrets fictifs pour une infrastructure informatique.

Le coffre-fort permet de stocker des identifiants simulés, de les retrouver par service, de les organiser par environnement, de rechercher des éléments selon plusieurs critères et de produire des rapports d’audit sans exposer les secrets eux-mêmes.

Le programme doit être suffisamment bien conçu pour qu’un autre développeur puisse l’utiliser comme bibliothèque, comprendre son API à partir de la documentation et vérifier son comportement à l’aide des tests.

**Objectif pédagogique :** intégrer les notions des laboratoires 010 à 019 dans un projet unique, en réutilisant également les acquis antérieurs lorsque cela est pertinent.

Aucune bibliothèque externe n’est nécessaire. Utilise la bibliothèque standard de Rust.

## 2\. Modèle métier

Un secret représente un identifiant associé à un service.

Chaque secret doit posséder au minimum :

- un identifiant numérique unique ;
- un nom de service ;
- un titre descriptif ;
- une valeur secrète fictive ;
- un environnement : développement, test ou production ;
- un statut : actif ou désactivé ;
- une catégorie : mot de passe, clé API ou jeton ;
- un compteur d’accès.

Tu dois choisir les types Rust adaptés à ce modèle. Évite de représenter toutes les informations par des chaînes de caractères lorsque des types plus précis sont possibles.

Certaines informations peuvent être absentes. Par exemple, un secret peut ne pas avoir de date d’expiration. Cette absence doit être représentée explicitement.

Définis des invariants métier : un titre ne peut pas être vide, un identifiant ne peut pas être dupliqué et une valeur secrète doit respecter les règles de validation que tu définiras.

## 3\. Fonctionnement attendu

### A. Gestion du coffre-fort

Le coffre-fort doit permettre de :

- créer un coffre vide ou initialisé avec une capacité donnée ;
- ajouter un secret ;
- rechercher un secret par identifiant ;
- rechercher un secret par nom de service ;
- modifier les propriétés autorisées d’un secret ;
- désactiver un secret sans nécessairement le supprimer ;
- supprimer un secret ;
- afficher le nombre de secrets et la capacité de stockage lorsque cela est pertinent.

Tu dois utiliser une collection séquentielle pour conserver les secrets et une table associative pour permettre la recherche par service.

Réfléchis aux responsabilités de chaque collection. Si tu maintiens deux structures de données représentant les mêmes secrets, explique comment tu garantis leur cohérence après une insertion, une modification ou une suppression.

Une insertion avec une clé de service déjà existante doit avoir un comportement explicitement défini : rejet, remplacement ou gestion de plusieurs secrets par service. Documente ton choix et teste-le.

### B. Recherche et filtrage

Le programme doit permettre de rechercher les secrets selon plusieurs critères combinables :

- environnement ;
- statut actif ou désactivé ;
- catégorie ;
- nom de service ;
- présence ou absence d’une date d’expiration.

Il doit également pouvoir retrouver le premier secret correspondant à un prédicat donné, déterminer sa position dans une collection et traiter les recherches infructueuses sans provoquer de panique.

Les fonctions de recherche ne doivent pas modifier les données lorsqu’elles sont censées effectuer uniquement une lecture.

### C. Parcours et transformation

Crée un rapport d’audit contenant, pour chaque secret retenu :

- son identifiant ;
- son service ;
- son environnement ;
- son statut ;
- une représentation masquée de sa valeur ;
- son niveau de risque.

Le rapport ne doit jamais contenir les valeurs secrètes originales.

Construis un pipeline de traitement qui filtre les secrets actifs de production, transforme les éléments retenus en entrées d’audit, puis collecte le résultat dans une collection adaptée.

Ajoute également :

- un rapport contenant les noms de services distincts ;
- un regroupement ou un index des secrets par environnement ;
- une validation en lot qui collecte les résultats dans un `Result` et s’arrête proprement lorsqu’une entrée est invalide.

Tu dois pouvoir justifier le choix de chaque type de collection et expliquer quand les adaptateurs d’itérateurs sont exécutés.

### D. Contrat d’audit extensible

Définis un trait commun aux différents types de secrets. Ce contrat doit permettre d’obtenir le nom de la ressource, de masquer sa valeur et d’évaluer son niveau de risque.

Prévois une méthode disposant d’une implémentation par défaut, par exemple pour générer une entrée d’audit.

Implémente ce contrat pour au moins deux types concrets de secrets, avec des comportements de masquage distincts.

Écris ensuite :

1. une fonction générique qui audite un élément satisfaisant le contrat ;
2. une fonction générique qui traite une collection homogène ;
3. un traitement capable de réunir plusieurs types de secrets dans une même collection au moyen d’objets de traits, si l’interface choisie le permet.

Explique pourquoi une fonction générique et une collection de `dyn Trait` ne représentent pas exactement la même approche du polymorphisme.

### E. Abstraction générique

Crée un conteneur générique `SecretBox<T>` qui encapsule une charge utile.

Il doit proposer des opérations permettant :

- de construire le conteneur ;
- d’accéder à sa charge utile ;
- de récupérer la charge utile en transférant son ownership ;
- de transformer la charge utile en un autre type ;
- d’exposer certaines méthodes uniquement lorsque `T` satisfait un trait donné.

Ajoute une structure générique associant une clé à une valeur.

Écris au moins un algorithme générique qui fonctionne sur plusieurs types comparables et une fonction générique possédant plusieurs contraintes de traits, exprimées de façon lisible.

Tu dois pouvoir utiliser ces abstractions sans dupliquer leur implémentation pour chaque type concret.

### F. Gestion des erreurs

Toutes les opérations susceptibles d’échouer doivent définir un comportement explicite.

Crée une énumération d’erreurs métier permettant de distinguer au minimum :

- un secret introuvable ;
- un identifiant déjà utilisé ;
- une entrée invalide ;
- une tentative d’accès interdite ;
- une modification impossible.

Les fonctions publiques doivent retourner `Result<T, E>` lorsque l’opération peut échouer, et `Option<T>` lorsqu’une valeur peut simplement être absente.

Utilise `?` pour propager les erreurs dans les chaînes d’appels lorsque les types de retour sont compatibles.

Ne remplace pas toutes les erreurs par un message générique. L’appelant doit pouvoir distinguer les causes d’échec.

Évite les `unwrap()` et `expect()` dans le traitement normal des entrées. Si tu en utilises dans un test, cela ne doit pas masquer le comportement que tu cherches à vérifier.

### G. Protection des données et encapsulation

Organise le projet en modules ayant chacun une responsabilité claire.

L’API publique doit permettre d’utiliser le coffre-fort sans donner accès directement à toutes ses données internes.

Les champs sensibles, le compteur d’accès et les mécanismes de validation doivent être protégés par l’encapsulation. Les opérations autorisées doivent passer par les méthodes prévues à cet effet.

Toute révélation d’un secret doit vérifier une autorisation fictive et incrémenter le compteur d’accès uniquement lorsque l’opération réussit.

Ne prétends pas implémenter une véritable cryptographie : le masquage demandé ici sert à contrôler l’exposition des données dans les rapports, pas à chiffrer les secrets.

## 4\. Organisation du projet

Propose une organisation de bibliothèque avec une séparation entre le modèle métier, le coffre-fort, l’audit, les erreurs et les interfaces publiques.

Tu peux, par exemple, utiliser une structure de ce type :

``` text
keep-vault/
├── Cargo.toml
├── src/
│   ├── lib.rs
│   ├── main.rs
│   ├── error.rs
│   ├── model/
│   │   ├── mod.rs
│   │   └── secret.rs
│   ├── vault/
│   │   ├── mod.rs
│   │   └── store.rs
│   ├── audit/
│   │   ├── mod.rs
│   │   └── report.rs
│   └── generic/
│       └── mod.rs
└── tests/
    └── vault_integration.rs
```

Cette structure est indicative. Tu peux la modifier si tu justifies tes choix.

Utilise les chemins de modules, les imports et les niveaux de visibilité adaptés. Ne rends pas tout public par commodité : expose uniquement ce dont les consommateurs ont besoin.

Le binaire doit servir de démonstration de la bibliothèque plutôt que de contenir toute la logique métier.

## 5\. Validation par les tests

Écris des tests unitaires couvrant au minimum les situations suivantes :

**Cas nominaux**

- création et insertion d’un secret valide ;
- recherche d’un secret existant ;
- modification d’un secret ;
- suppression d’un secret ;
- génération d’un rapport masqué ;
- fonctionnement des abstractions génériques ;
- fonctionnement des implémentations du trait d’audit.

**Cas limites**

- coffre vide ;
- recherche dans une collection vide ;
- premier et dernier éléments d’une collection ;
- service sans secret associé ;
- clé déjà présente ;
- titre contenant uniquement des espaces ;
- date d’expiration absente ;
- secret situé exactement à la limite minimale ou maximale de longueur que tu as définie.

**Cas d’erreur**

- identifiant dupliqué ;
- secret invalide ;
- recherche infructueuse ;
- autorisation incorrecte ;
- tentative de modifier ou de supprimer un élément inexistant ;
- validation en lot contenant une entrée invalide.

**Propriétés à préserver**

- aucun rapport d’audit ne révèle la valeur secrète ;
- une opération refusée ne modifie pas silencieusement les données ;
- le compteur d’accès ne s’incrémente qu’après une révélation réussie ;
- les index et collections restent cohérents après les mutations ;
- les erreurs retournées correspondent à la cause réelle.

Privilégie les assertions sur les valeurs exactes et les variantes d’erreur attendues plutôt que des tests qui vérifient seulement qu’une fonction ne panique pas.

Ajoute au moins quelques tests d’intégration qui utilisent exclusivement l’API publique. Ils doivent vérifier que les consommateurs peuvent employer la bibliothèque sans accéder aux détails privés.

## 6\. Documentation

Documente la bibliothèque et son API publique avec `//!` et `///`.

La documentation doit expliquer :

- la finalité de chaque module public ;
- les invariants maintenus par les structures ;
- les arguments et les valeurs de retour ;
- les conditions d’erreur ;
- les limites du mécanisme de masquage ;
- un exemple complet de création, d’insertion et de recherche d’un secret fictif.

Ajoute des exemples de code dans les sections `# Examples` des éléments appropriés. Ces exemples doivent pouvoir être vérifiés par les doctests.

Pour les fonctions retournant `Result`, explique les erreurs possibles dans `# Errors`. Si une fonction peut paniquer, documente les circonstances dans `# Panics` ou, de préférence, conçois l’API pour éviter les paniques inutiles.

## 7\. Contraintes de réalisation

- Utilise Rust stable et l’édition 2021.
- N’ajoute pas de dépendance externe sans justification solide.
- Respecte l’ownership et le borrowing : évite les clones uniquement destinés à contourner le compilateur.
- Utilise des références lorsque la fonction n’a pas besoin de prendre possession des données.
- Utilise des références mutables pour les modifications en place lorsque c’est approprié.
- Ne construis pas inutilement des collections intermédiaires dans les pipelines.
- Ne rends pas les structures internes publiques pour simplifier les tests.
- Sépare les erreurs métier des détails d’implémentation.
- Ne laisse pas de TODO essentiels dans le résultat final.

Tu peux employer les notions antérieures aux laboratoires 010 à 019, notamment les structs, enums, `match`, `Option`, `Result`, `?`, les emprunts et le transfert d’ownership. Elles sont nécessaires pour réaliser correctement le projet.

## 8\. Critères d’acceptation

Le projet est terminé lorsque :

1. Le coffre-fort permet de créer, rechercher, modifier et supprimer des secrets fictifs.
2. Les recherches et rapports exploitent les collections et les itérateurs de manière pertinente.
3. Le trait d’audit est implémenté par plusieurs types concrets.
4. Les abstractions génériques fonctionnent avec plusieurs types.
5. Les modules protègent les invariants et exposent une API publique minimale.
6. Les erreurs sont explicites et propagées proprement.
7. Les tests couvrent les cas nominaux, limites, erreurs et règles de sécurité.
8. Les tests d’intégration fonctionnent uniquement avec l’API publique.
9. La documentation est complète et ses exemples compilent.
10. Le projet passe les commandes suivantes :

``` bash
cargo fmt --check
cargo test --workspace
cargo test --doc
cargo clippy --workspace --all-targets -- -D warnings
cargo doc --no-deps
```

## 9\. Questions à traiter après l’implémentation

Rédige une courte note technique répondant à ces questions :

1. Pourquoi utiliser à la fois `Vec` et `HashMap` ? Quel coût de cohérence supplémentaire cela implique-t-il ?
2. Quand choisir `iter()`, `iter_mut()` ou `into_iter()` ?
3. Pourquoi un pipeline d’itérateurs est-il paresseux, et à quel moment le calcul est-il réellement exécuté ?
4. Quelle différence existe entre `map` et `and_then` lorsqu’on travaille avec `Option` ou `Result` ?
5. Dans quelles situations choisirais-tu des génériques plutôt que des objets de traits ?
6. Pourquoi les contraintes de traits sont-elles utiles pour définir des abstractions génériques ?
7. Comment les règles de visibilité contribuent-elles à préserver les invariants métier ?
8. Pourquoi les tests d’intégration ne doivent-ils pas dépendre des champs privés ?
9. En quoi les doctests améliorent-ils la fiabilité de l’API publique ?
10. Quelles opérations sont susceptibles de coûter le plus cher, et quelle complexité temporelle est attendue pour les recherches, les insertions et les rapports ?

**Livrable final :** une bibliothèque Rust fonctionnelle, testée et documentée, accompagnée de la note technique. L’objectif n’est pas de reproduire les laboratoires séparément, mais de démontrer que tu sais combiner leurs notions pour construire un système cohérent.