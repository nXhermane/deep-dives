
# Système de Gestion de Bibliothèque

Ce document constitue le README pour le projet de gestion de bibliothèque. Il décrit l'architecture globale, les diagrammes de conception et les aspects techniques à considérer pour la mise en place d'une solution robuste et évolutive dans un contexte d'entreprise.

## Table des Matières

- [Système de Gestion de Bibliothèque](#système-de-gestion-de-bibliothèque)
  - [Table des Matières](#table-des-matières)
  - [Introduction](#introduction)
  - [Architecture du Système](#architecture-du-système)
  - [Diagrammes de Conception](#diagrammes-de-conception)
    - [1. Diagramme de Contexte](#1-diagramme-de-contexte)
    - [2. Diagramme de Cas d'Utilisation](#2-diagramme-de-cas-dutilisation)
    - [3. Diagramme de Classes](#3-diagramme-de-classes)
    - [4. Diagramme de Séquence](#4-diagramme-de-séquence)
    - [5. Diagramme d'Activité](#5-diagramme-dactivité)
    - [6. Diagramme d'État](#6-diagramme-détat)
    - [7. Diagramme de Déploiement](#7-diagramme-de-déploiement)
    - [8. Diagramme de Flux de Données (DFD)](#8-diagramme-de-flux-de-données-dfd)
    - [9. Diagramme de Sécurité](#9-diagramme-de-sécurité)
    - [10. Diagramme de Communication](#10-diagramme-de-communication)
  - [Conclusion](#conclusion)
  - [Licences et Références](#licences-et-références)

## Introduction

Le système de gestion de bibliothèque proposé vise à gérer l'ensemble des processus liés aux emprunts, réservations, retours, et avis sur les livres. Conçu autour d'une architecture en couches, il met en œuvre une modélisation orientée domaine (Domain-Driven Design) afin d'assurer une solution évolutive et maintenable en entreprise.

## Architecture du Système

L'architecture se compose de trois couches principales :

1. **Couche Domaine**  
   Contient la logique métier et les entités principales (User, Book, Loan, Reservation, Review).  
2. **Couche Applicative (Services)**  
   Ordonne les cas d'usage en orchestrant les interactions entre les entités.  
3. **Couche Infrastructure**  
   Gère la persistance des données, la communication réseau et la gestion de la concurrence.

Cette séparation permet de garantir une évolutivité, une facilité de test et une maintenance simplifiée du système.

## Diagrammes de Conception

### 1. Diagramme de Contexte

Ce diagramme définit les limites du système et montre ses interactions avec les acteurs externes.

```mermaid
graph LR
    subgraph "Système de Gestion de Bibliothèque"
        A[Gestion des Emprunts et Réservations]
    end
    Utilisateur -->|Demande d'emprunt, réservation| A
    Administrateur -->|Gestion des livres et utilisateurs| A
    SystèmeDePaiement -->|Paiement des pénalités| A
```

### 2. Diagramme de Cas d'Utilisation

Ce diagramme illustre les scénarios fonctionnels et les interactions entre les acteurs et le système.

```mermaid
graph TD
    A[Utilisateur] --> B(Emprunter un Livre)
    A --> C(Retourner un Livre)
    A --> D(Réserver un Livre)
    A --> E(Laisser un Avis)
    F[Administrateur] --> G(Gérer les Livres)
    F --> H(Gérer les Utilisateurs)
    F --> I(Gérer les Emprunts)

```

### 3. Diagramme de Classes

Ce diagramme décrit la structure du domaine en montrant les entités, leurs attributs et leurs relations.

```mermaid
classDiagram
    class User {
      - id : string
      - name : string
      - username : string
      - email : string
      - maxLoans : int
      - activeLoans : List<Loan>
      - loanHistory : List<Loan>
      - penalties : double
      + canBorrow() : bool
      + borrowBook(book : Book) : Loan
      + returnBook(book : Book) : void
    }

    class Book {
      - isbn : string
      - title : string
      - author : string
      - year : int
      - status : BookStatus
      - reviews : List<Review>
      - categories : Set<string>
      + isAvailable() : bool
      + addReview(review : Review) : void
      + getAverageRating() : double
    }

    class Loan {
      - id : string
      - user : User
      - book : Book
      - startDate : DateTime
      - dueDate : DateTime
      - returnDate : DateTime
      - status : LoanStatus
      + extendLoan() : bool
      + returnBook() : void
      + calculatePenalty() : double
    }

    class Reservation {
      - id : string
      - user : User
      - book : Book
      - reservationDate : DateTime
      - queuePosition : int
      - status : ReservationStatus
      + notifyUser() : void
      + expireReservation() : void
    }

    class Review {
      - id : string
      - user : User
      - book : Book
      - rating : int
      - comment : string
      - date : DateTime
      - modified : bool
      + updateReview(newRating : int, newComment : string) : void
    }
    
    User "1" -- "0..*" Loan : emprunte
    Book "1" -- "0..*" Loan : concerné par
    User "1" -- "0..*" Reservation : réserve
    Book "1" -- "0..*" Reservation : concerné par
    User "1" -- "0..*" Review : rédige
    Book "1" -- "0..*" Review : reçoit
```

### 4. Diagramme de Séquence

Ce diagramme détaille l’ordre chronologique des interactions pour le processus d’emprunt.

```mermaid
sequenceDiagram
  participant U as Utilisateur
  participant LS as LoanService
  participant B as Book
  participant DB as Base de Données

  U->>LS: Demande d'emprunt de livre
  LS->>B: Vérifier disponibilité
  B-->>LS: Livre disponible
  LS->>DB: Créer l'emprunt (durée 21 jours)
  DB-->>LS: Confirmation d'enregistrement
  LS-->>U: Emprunt validé et notifié
```

### 5. Diagramme d'Activité

Ce diagramme représente le workflow complet du processus d’emprunt, depuis la demande jusqu’à la notification.


```mermaid
flowchart TD
    A[Début: Demande d'emprunt] --> B[Vérifier l'éligibilité utilisateur]
    B --> C{Utilisateur peut emprunter ?}
    C --|Oui|--> D[Vérifier disponibilité du livre]
    C --|Non|--> E[Afficher message d'erreur]
    D --> F{Livre disponible ?}
    F --|Oui|--> G[Créer un emprunt : 21 jours]
    F --|Non|--> H[Afficher indisponibilité]
    G --> I[Notifier l'utilisateur]
    I --> J[Fin]
    E --> J
    H --> J

```

### 6. Diagramme d'État

Ce diagramme montre les différents états possibles d’un prêt et les transitions entre ces états.

```mermaid
stateDiagram-v2
    [*] --> Actif
    Actif --> Extended : Prolongation
    Actif --> Overdue : Passage en retard
    Extended --> Overdue : Passage en retard
    Actif --> Returned : Retour du livre
    Overdue --> Returned : Retour du livre
```

### 7. Diagramme de Déploiement

Ce diagramme illustre la distribution physique du système sur l'infrastructure matérielle et les interactions entre les composants.

```mermaid
graph LR
    subgraph Serveur
        A[API REST]
        B[Services Applicatifs]
        C[Base de Données]
    end
    subgraph Clients
        D[Application Web]
        E[Application Mobile]
    end
    D --> A
    E --> A
    A --> B
    B --> C
```

### 8. Diagramme de Flux de Données (DFD)

Ce diagramme représente les flux d'informations entre les processus du système, les sources externes et les bases de données.

```mermaid
flowchart TD
    A[Utilisateur] -->|Demande d'emprunt| B[Processus d'Emprunt]
    B -->|Vérification et création| C[Base de Données]
    C -->|Retour d'information| B
    B -->|Notification d'emprunt| A
    A -->|Demande de réservation| D[Processus de Réservation]
    D --> C
    C --> D
    D -->|Confirmation de réservation| A
```

### 9. Diagramme de Sécurité

Ce diagramme met en avant les composants liés à l'authentification, l'autorisation et la protection des ressources.

```mermaid
graph LR
    A[Client] --> B[API REST]
    B --> C[Service d'Authentification]
    B --> D[Service d'Autorisation]
    C --> E[Gestion des Sessions]
    D --> E
    E --> F[Accès aux Ressources Sécurisées]
```

### 10. Diagramme de Communication

Ce diagramme se focalise sur la structure et le contenu des échanges de messages entre les composants du système.

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant G as API Gateway
    participant S as Service de Prêt
    participant DB as Base de Données

    U->>G: Requête d'emprunt de livre
    G->>S: Transfert de la requête
    S->>DB: Vérification et enregistrement de l'emprunt
    DB-->>S: Confirmation d'enregistrement
    S-->>G: Réponse de succès
    G-->>U: Confirmation d'emprunt
```

## Conclusion

Ces diagrammes offrent une vue complète et détaillée du système de gestion de bibliothèque. Ils servent à documenter, communiquer et guider le développement du projet en assurant une compréhension commune entre les équipes techniques et métiers. Ce README constitue ainsi une base solide pour la conception et l'évolution du système.

## Licences et Références

- Ce projet est sous licence MIT.
- Les diagrammes Mermaid sont générés à partir des spécifications de [MermaidJS](https://mermaid.js.org/).

