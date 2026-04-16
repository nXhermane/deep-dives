# Explication — Combiner les activités GitHub et produire un résultat agrégé

Ce document explique, en pseudo‑code et en français, comment combiner les événements GitHub récupérés via `https://api.github.com/users/{username}/events` afin de produire un résumé lisible et agrégé par dépôt et par type d'événement. Il suit la logique présentée dans le dépôt `rust_github-activity_cli`.

## Objectifs
- Récupérer les événements publics récents d'un utilisateur GitHub.
- Extraire et normaliser les champs utiles (type, repo, payload, created_at).
- Agréger les événements par dépôt puis par type d'événement.
- Générer une sortie lisible (phrases courtes) à afficher en CLI.

## Étapes (haut niveau)
1. Faire la requête HTTP GET vers `https://api.github.com/users/{username}/events`.
2. Désérialiser la réponse JSON en tableau d'événements (conserver `type`, `repo.name`, `payload`, `created_at`).
3. Parcourir chaque événement et normaliser un message selon `type`.
4. Remplir une table d'agrégation : Map<repo, RepoAggregate>.
5. Générer et afficher le résumé trié.

## Pseudocode (style Rust / générique)

```text
// Structures de données
struct Event {
    event_type: String       // ex: "PushEvent"
    repo_name: String        // ex: "user/repo"
    payload: JSON            // raw payload (serde_json::Value)
    created_at: Option<String> // timestamp (ISO)
}

struct RepoAggregate {
    repo_name: String
    counts: Map<String, int>                 // counts[event_type] -> nombre d'événements
    details: Map<String, List<String>>       // details[event_type] -> messages (ex. "Pushed 3 commits")
    total_events: int
}

// Main flow
events = fetch_events_from_github(username)
parsed_events = deserialize_to_Event_list(events)

aggregates = Map<String, RepoAggregate>() // clé = repo_name

for event in parsed_events:
    repo = event.repo_name
    agg = aggregates.get_or_insert(repo, RepoAggregate{ repo_name: repo, counts: empty_map, details: empty_map, total_events: 0 })
    agg.total_events += 1
    agg.counts[event.event_type] += 1

    // Normaliser selon le type pour obtenir un message utile
    match event.event_type:
        "PushEvent":
            // payload["size"] = nombre de commits poussés
            n_commits = event.payload.get("size").as_int().unwrap_or(1)
            branch = event.payload.get("ref").as_str().map(strip "refs/heads/").unwrap_or("unknown")
            msg = format("Pushed {n_commits} commits to {repo}:{branch}")
            agg.details["PushEvent"].push(msg)

        "CreateEvent":
            ref_type = event.payload.get("ref_type").as_str().unwrap_or("unknown") // branch/tag/repo
            ref_name = event.payload.get("ref").as_str().unwrap_or("")
            msg = format("Created {ref_type} {ref_name} in {repo}")
            agg.details["CreateEvent"].push(msg)

        "DeleteEvent":
            ref_type = event.payload.get("ref_type").as_str().unwrap_or("unknown")
            ref_name = event.payload.get("ref").as_str().unwrap_or("")
            msg = format("Deleted {ref_type} {ref_name} in {repo}")
            agg.details["DeleteEvent"].push(msg)

        "IssuesEvent":
            action = event.payload.get("action").as_str().unwrap_or("performed")
            issue_number = event.payload.get("issue").and_then(|i| i.get("number")).and_then(|n| n.as_int()).unwrap_or(0)
            title = event.payload.get("issue").and_then(|i| i.get("title")).and_then(|t| t.as_str()).unwrap_or("")
            msg = format("{action} issue #{issue_number} \"{title}\" in {repo}")
            agg.details["IssuesEvent"].push(msg)

        "PullRequestEvent":
            action = event.payload.get("action").as_str().unwrap_or("performed")
            pr_number = event.payload.get("pull_request").and_then(|p| p.get("number")).and_then(|n| n.as_int()).unwrap_or(0)
            merged = event.payload.get("pull_request").and_then(|p| p.get("merged")).and_then(|m| m.as_bool()).unwrap_or(false)
            msg = if merged then format("Merged PR #{pr_number} in {repo}") else format("{action} PR #{pr_number} in {repo}")
            agg.details["PullRequestEvent"].push(msg)

        "WatchEvent":
            action = event.payload.get("action").as_str().unwrap_or("started")
            msg = format("{action} watching/starred {repo}")
            agg.details["WatchEvent"].push(msg)

        default:
            msg = format("Other event {event.event_type} for {repo}")
            agg.details[event.event_type].push(msg)

// Après aggregation, construire la sortie
results = []
for each repo, agg in aggregates:
    results.push(format("{repo}: {agg.total_events} events"))
    for each (event_type, count) in agg.counts:
        details_preview = take_first_N(agg.details[event_type], 3)
        results.push(format("  - {event_type}: {count} -> {details_preview_joined}"))

print(join_lines(results))
```

## Exemple de sortie souhaitée
- user/repo-a: 5 events
  - PushEvent: 3 -> Pushed 5 commits to user/repo-a:main; Pushed 1 commit to user/repo-a:dev
  - IssuesEvent: 1 -> Opened issue #12 "bug..."
  - WatchEvent: 1 -> Starred user/repo-a
- user/repo-b: 2 events
  - PullRequestEvent: 2 -> Opened PR #2; Merged PR #1

## Conseils Rust spécifiques
- Dans vos structs Rust, ajouter `payload: serde_json::Value` et `created_at: Option<String>` pour capturer les informations supplémentaires.
- Utiliser `HashMap<String, RepoAggregate>` (std::collections::HashMap).
- Pour extraire les valeurs du payload, utiliser `value.get("field").and_then(|v| v.as_*)` pour éviter les `unwrap()` et panics.
- Garder des messages concis pour l'affichage en CLI et limiter les détails affichés (ex : 3 messages par type).
- Ajouter des fixtures de tests (JSON d'événements) pour valider le parsing et l'agrégation.

---

Ce fichier explique la logique et donne un pseudocode prêt à être transformé en fonctions Rust (par ex. `parse_event`, `normalize_event_message`, `aggregate_events`, `format_report`).