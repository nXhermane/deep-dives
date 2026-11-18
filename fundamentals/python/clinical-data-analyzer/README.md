# Deep Dive 01 — Clinical Data Stream Analyzer

> **Thème :** Structures de données Python, algorithmes, complexité et conception logicielle  
> **Langage :** Python 3.13+  
> **Gestionnaire de projet :** uv  
> **Difficulté :** Intermédiaire à avancé  
> **Type :** Exercice algorithmique et conception logicielle

---

# 1. Contexte

Un établissement hospitalier reçoit quotidiennement des milliers de mesures provenant de différents services.

Chaque mesure représente une observation effectuée sur un patient : température, poids, fréquence cardiaque, tension artérielle, glycémie, etc.

Ces observations arrivent sous forme de flux de données. Elles peuvent être reçues dans le désordre, être dupliquées, être invalides ou arriver plusieurs fois pour un même patient.

Le système actuel stocke simplement les observations dans des listes et effectue des recherches séquentielles.

Cette approche devient problématique lorsque le volume de données augmente.

Tu es chargé de concevoir un moteur d'analyse capable de :

- Recevoir et organiser les observations.
- Détecter les doublons.
- Identifier les mesures anormales.
- Maintenir des statistiques actualisées.
- Retrouver rapidement les dernières observations d'un patient.
- Identifier les patients nécessitant une attention particulière.
- Produire des rapports statistiques.

Le moteur doit être suffisamment efficace pour traiter plusieurs centaines de milliers d'observations.

**Ton objectif n'est pas simplement de faire fonctionner le programme. Tu dois réfléchir aux structures de données, aux algorithmes et à leurs coûts.**

# 2. Modèle de données

Une observation possède les propriétés suivantes :

| Champ | Type | Description |
|---|---|---|
| id | str | Identifiant unique de l'observation |
| patient_id | str | Identifiant du patient |
| metric | str | Type de mesure |
| value | float | Valeur observée |
| unit | str | Unité de mesure |
| timestamp | int | Timestamp Unix |
| source | str | Service ayant effectué la mesure |

Exemple :

```python
observation = {
    "id": "OBS-001",
    "patient_id": "PAT-001",
    "metric": "temperature",
    "value": 38.5,
    "unit": "C",
    "timestamp": 1795032000,
    "source": "pediatrics"
}
```

Les métriques disponibles sont :

```python
METRICS = {
    "temperature": "C",
    "weight": "kg",
    "heart_rate": "bpm",
    "glucose": "mmol/L",
    "systolic_pressure": "mmHg",
    "diastolic_pressure": "mmHg"
}
```

Pour les besoins de l'exercice, utilise les intervalles techniques suivants pour identifier les valeurs potentiellement anormales :

| Métrique | Minimum | Maximum |
|---|---:|---:|
| temperature | 35.0 | 42.0 |
| weight | 0.5 | 250.0 |
| heart_rate | 30 | 250 |
| glucose | 1.0 | 40.0 |
| systolic_pressure | 40 | 300 |
| diastolic_pressure | 20 | 200 |

Ces limites sont des seuils artificiels de validation technique pour l'exercice. Elles ne constituent pas des références médicales.

# 3. Architecture générale

Tu dois concevoir un système organisé autour de quatre composants :

```text
Clinical Data Stream Analyzer
│
├── ObservationStore
│   └── Stockage et recherche des observations
│
├── AnomalyDetector
│   └── Détection des valeurs anormales
│
├── StatisticsEngine
│   └── Calcul et mise à jour des statistiques
│
└── ReportGenerator
    └── Génération des rapports
```

Tu peux modifier cette organisation si tu justifies tes choix.

# 4. Partie I — Gestion des observations

## 4.1. Réception des observations

Implémente une méthode :

```python
add_observation(observation)
```

Elle doit :

1. Vérifier la structure de l'observation.
2. Vérifier les types des champs.
3. Vérifier que la métrique existe.
4. Vérifier que l'unité correspond à la métrique.
5. Vérifier que la valeur est un nombre fini.
6. Vérifier que l'identifiant n'existe pas déjà.
7. Enregistrer l'observation.

Une observation invalide ne doit jamais être enregistrée.

## 4.2. Détection des doublons

Deux observations possédant le même identifiant sont considérées comme des doublons.

Le système doit pouvoir détecter un doublon en temps constant moyen.

Réfléchis à la structure de données appropriée.

## 4.3. Organisation des données

Le système doit permettre de retrouver :

- Toutes les observations d'un patient.
- Toutes les observations d'une métrique.
- Toutes les observations d'un service.
- Toutes les observations reçues pendant une période donnée.

Évite de parcourir inutilement l'ensemble des observations lorsqu'une recherche peut être optimisée.

Tu dois notamment maintenir des index adaptés.

# 5. Partie II — Gestion des structures de données

Cette partie est obligatoire : tu dois exploiter consciemment les différentes structures de données Python.

## 5.1. Listes

Utilise des listes pour conserver les séquences d'observations lorsque l'ordre est important.

Implémente :

```python
get_patient_history(patient_id)
```

Les résultats doivent être retournés dans l'ordre chronologique.

Attention : les observations peuvent arriver dans le désordre.

## 5.2. Dictionnaires

Utilise des dictionnaires pour construire des index permettant des recherches rapides.

Par exemple :

```python
observations_by_id = {}
observations_by_patient = {}
observations_by_metric = {}
```

Tu es libre de choisir les structures internes.

Explique pourquoi chaque dictionnaire est nécessaire et quelle opération il optimise.

## 5.3. Ensembles

Utilise des ensembles pour :

- Détecter les identifiants déjà utilisés.
- Retrouver les patients ayant présenté au moins une anomalie.
- Calculer les patients communs entre plusieurs services.
- Identifier les patients présents dans un service mais absents d'un autre.

Implémente :

```python
get_common_patients(service_a, service_b)
```

Et :

```python
get_exclusive_patients(service_a, service_b)
```

## 5.4. Tuples

Tu dois utiliser les tuples pour représenter les éléments qui ne doivent pas être modifiés.

Par exemple :

- Une paire de coordonnées temporelles.
- Une clé composée de plusieurs dimensions.
- Un résultat statistique fixe.
- Une plage de valeurs.

Implémente notamment une méthode permettant de retrouver les observations d'un patient pour une métrique donnée.

Réfléchis à l'utilisation d'un tuple comme clé de dictionnaire.

Tu dois également utiliser le tuple unpacking dans au moins deux endroits pertinents du programme.

## 5.5. Structures avancées

Utilise obligatoirement :

- `Counter` pour compter les occurrences des métriques.
- `defaultdict` pour au moins un index.
- `deque` pour maintenir un historique glissant ou une file de traitement.

Explique pourquoi ces structures sont préférables aux alternatives envisagées.

# 6. Partie III — Détection des anomalies

Une observation est considérée comme potentiellement anormale lorsque sa valeur sort des limites techniques définies dans le modèle de données.

Implémente :

```python
detect_anomalies()
```

Le système doit identifier :

- Les observations anormales.
- Les patients concernés.
- Les métriques concernées.
- Le nombre d'anomalies par patient.
- Le nombre d'anomalies par métrique.

Une anomalie doit conserver une référence vers l'observation d'origine.

Attention : une anomalie ne doit pas être confondue avec une observation invalide.

Une valeur invalide est rejetée. Une valeur techniquement valide mais située hors de l'intervalle attendu est enregistrée et signalée.

# 7. Partie IV — Moteur statistique

Implémente les fonctions suivantes :

```python
calculate_mean(values)
calculate_median(values)
calculate_min_max(values)
calculate_variance(values)
calculate_standard_deviation(values)
```

Tu dois comprendre les algorithmes derrière ces calculs.

Contraintes :

1. Ne pas utiliser NumPy.
2. Ne pas utiliser Pandas.
3. Implémenter toi-même les calculs.
4. Gérer les collections vides.
5. Éviter les divisions par zéro.

Pour la variance, utilise la variance de population :

\[
\sigma^2 = \frac{1}{N}\sum_{i=1}^{N}(x_i-\mu)^2
\]

Et pour l'écart-type :

\[
\sigma = \sqrt{\sigma^2}
\]

## 7.1. Statistiques par patient

Pour chaque patient, le système doit pouvoir produire :

- Nombre total d'observations.
- Nombre d'observations par métrique.
- Moyenne par métrique.
- Valeur minimale et maximale.
- Nombre d'anomalies.

## 7.2. Statistiques globales

Le système doit également produire les mêmes statistiques à l'échelle globale.

## 7.3. Optimisation

Un calcul statistique effectué plusieurs fois sur les mêmes données peut être coûteux.

Propose un mécanisme permettant de maintenir certaines statistiques à jour lors de l'arrivée de nouvelles observations.

Tu dois comparer :

- Le recalcul complet.
- La mise à jour incrémentale.

Explique les avantages et les limites de chaque approche.

# 8. Partie V — Historique glissant

Le système doit maintenir les 10 dernières observations reçues pour chaque patient.

Utilise `collections.deque`.

Implémente :

```python
get_recent_observations(patient_id, limit=10)
```

Le système doit pouvoir ajouter une observation sans déplacer manuellement tous les éléments existants.

Réfléchis à la différence entre :

- Les 10 dernières observations reçues.
- Les 10 observations ayant les timestamps les plus récents.

Ces deux notions ne sont pas nécessairement équivalentes lorsque les données arrivent dans le désordre.

Explique comment ton architecture gère cette différence.

# 9. Partie VI — Génération de rapports

Implémente :

```python
generate_report()
```

Le rapport doit être un dictionnaire Python contenant :

```python
{
    "total_observations": 0,
    "total_patients": 0,
    "total_anomalies": 0,
    "metrics_distribution": {},
    "patients_with_anomalies": [],
    "global_statistics": {},
}
```

Tu dois ensuite exporter le rapport dans un fichier JSON.

Utilise :

- `json`
- `pathlib`
- `datetime`

Le rapport doit contenir la date de génération.

# 10. Partie VII — Algorithmique avancée

Cette partie est destinée à pousser ta réflexion.

## 10.1. Top K patients

Implémente :

```python
get_top_k_patients_by_anomalies(k)
```

La méthode doit retourner les K patients possédant le plus grand nombre d'anomalies.

Tu dois comparer au moins deux approches :

1. Trier tous les patients.
2. Utiliser `heapq.nlargest()` ou un heap.

Analyse les complexités.

## 10.2. Recherche temporelle

Implémente :

```python
get_observations_between(patient_id, start, end)
```

La méthode doit retourner les observations dont le timestamp appartient à l'intervalle demandé.

Tu dois proposer une approche optimisée lorsque les historiques sont triés chronologiquement.

Tu peux notamment étudier `bisect`.

## 10.3. Détection de tendances

Pour chaque patient et chaque métrique, détecte si les dernières observations présentent une tendance :

- Croissante.
- Décroissante.
- Stable.

Pour simplifier, considère une tendance croissante lorsque chaque valeur est supérieure ou égale à la précédente, avec au moins une augmentation stricte.

Même principe pour la tendance décroissante.

Une séquence qui ne respecte aucune de ces conditions est considérée comme non monotone.

Implémente :

```python
detect_trend(patient_id, metric, limit=5)
```

La méthode doit retourner un résultat structuré.

# 11. Contraintes techniques

## 11.1. Environnement

Tu dois utiliser `uv`.

Initialisation :

```bash
uv init clinical-data-analyzer
cd clinical-data-analyzer
uv python pin 3.13
```

Utilise Python 3.13 ou une version ultérieure compatible.

## 11.2. Organisation du projet

Utilise une architecture modulaire.

Proposition :

```text
clinical-data-analyzer/
│
├── pyproject.toml
├── uv.lock
├── README.md
│
├── src/
│   └── clinical_analyzer/
│       ├── __init__.py
│       ├── main.py
│       │
│       ├── domain/
│       │   ├── models.py
│       │   └── exceptions.py
│       │
│       ├── storage/
│       │   └── observation_store.py
│       │
│       ├── analysis/
│       │   ├── anomaly_detector.py
│       │   ├── statistics_engine.py
│       │   └── trend_detector.py
│       │
│       └── reporting/
│           └── report_generator.py
│
└── tests/
    ├── test_storage.py
    ├── test_anomalies.py
    ├── test_statistics.py
    ├── test_trends.py
    └── test_reporting.py
```

Tu peux adapter cette organisation si tu justifies tes décisions.

## 11.3. Dépendances

Utilise uniquement la bibliothèque standard Python pour l'implémentation.

Pour les tests, tu peux ajouter pytest :

```bash
uv add --dev pytest
```

Exécution :

```bash
uv run pytest
```

## 11.4. Qualité du code

Ton code doit respecter les exigences suivantes :

- Type hints sur les fonctions publiques.
- Docstrings sur les classes et fonctions publiques.
- PEP 8.
- Pas de variables globales modifiables servant de stockage.
- Séparation des responsabilités.
- Gestion explicite des erreurs.
- Pas de dépendances inutiles.
- Tests unitaires couvrant les cas limites.

# 12. Tests et cas limites

Tu dois absolument tester les situations suivantes :

1. Deux observations possédant le même identifiant.
2. Une observation avec une métrique inconnue.
3. Une observation avec une unité incorrecte.
4. Une valeur NaN.
5. Une valeur infinie.
6. Une liste d'observations vide.
7. Un patient sans historique.
8. Une recherche temporelle sans résultat.
9. Un patient possédant plusieurs anomalies.
10. Plusieurs observations avec le même timestamp.
11. Des observations reçues dans le désordre.
12. Un K supérieur au nombre de patients.
13. Un K égal à zéro.
14. Une tendance avec une seule observation.
15. Une tendance avec des valeurs identiques.

# 13. Analyse de complexité

Pour chaque méthode publique importante, documente :

- La complexité temporelle.
- La complexité spatiale.
- Les structures de données utilisées.
- Les compromis effectués.

Ajoute un tableau dans ton README :

| Opération | Complexité attendue | Structure utilisée |
|---|---|---|
| Recherche par ID | À compléter | À compléter |
| Recherche par patient | À compléter | À compléter |
| Ajout d'observation | À compléter | À compléter |
| Recherche temporelle | À compléter | À compléter |
| Top K patients | À compléter | À compléter |
| Détection d'anomalies | À compléter | À compléter |

Ne donne pas simplement une complexité théorique. Analyse ton implémentation réelle.

# 14. Benchmark

Génère artificiellement :

- 1 000 observations.
- 10 000 observations.
- 100 000 observations.
- 500 000 observations.

Mesure le temps nécessaire pour :

1. Insérer les observations.
2. Rechercher un patient.
3. Rechercher une métrique.
4. Calculer les statistiques globales.
5. Générer un rapport.
6. Trouver les 10 patients ayant le plus d'anomalies.

Utilise `time.perf_counter()`.

Compare au moins deux stratégies de stockage pour une opération importante.

Les données doivent être générées de manière déterministe afin de rendre les benchmarks reproductibles.

# 15. Livrables

À la fin, ton dépôt doit contenir :

- [ ] Un moteur fonctionnel.
- [ ] Une architecture modulaire.
- [ ] Des tests unitaires.
- [ ] Un générateur de données synthétiques.
- [ ] Un benchmark reproductible.
- [ ] Un rapport JSON d'exemple.
- [ ] Un README documentant l'architecture.
- [ ] Une analyse de complexité.
- [ ] Une justification des structures de données choisies.

# 16. Critères d'évaluation

| Critère | Pondération |
|---|---:|
| Maîtrise des structures de données | 20 % |
| Correctness algorithmique | 20 % |
| Complexité et optimisation | 20 % |
| Architecture et modularité | 15 % |
| Qualité Python et typage | 10 % |
| Tests et cas limites | 10 % |
| Benchmark et analyse | 5 % |
| **Total** | **100 %** |

# 17. Questions de réflexion

Réponds à ces questions dans ton README.

1. Pourquoi un dictionnaire est-il préférable à une liste pour rechercher une observation par identifiant ?
2. Dans quelles circonstances un tuple peut-il être utilisé comme clé d'un dictionnaire ?
3. Pourquoi `deque` est-il plus adapté qu'une liste pour une file FIFO ?
4. Quelle est la différence entre une copie superficielle et une copie profonde ?
5. Pourquoi les opérations d'insertion au début d'une liste sont-elles coûteuses ?
6. Comment une table de hachage gère-t-elle les collisions ?
7. Pourquoi les performances moyennes d'un dictionnaire ne garantissent-elles pas une complexité constante dans tous les cas ?
8. Dans quelles circonstances un recalcul statistique complet est-il préférable à une mise à jour incrémentale ?
9. Quelle différence fais-tu entre l'ordre d'arrivée et l'ordre chronologique ?
10. Comment pourrais-tu faire évoluer ton moteur pour traiter des flux de données en continu sans conserver toutes les observations en mémoire ?

---

# 18. Règle finale

Ne cherche pas à terminer rapidement.

Tu dois être capable d'expliquer pourquoi tu as choisi chaque structure de données et pourquoi tu as écarté les alternatives.

**L'objectif final est de développer une intuition algorithmique en Python, pas simplement d'apprendre sa syntaxe.**

Une implémentation qui fonctionne mais dont les choix algorithmiques ne sont pas justifiés ne constitue pas une résolution complète de cet exercice.