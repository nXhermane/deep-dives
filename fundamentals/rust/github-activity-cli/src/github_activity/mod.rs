use std::collections::HashMap;

use crate::github_activity::types::GithubActivityAggregator;
use crate::github_activity::types::GithubActivityEventsResponse;
use crate::github_activity::types::GithubEventType;
pub mod types;

pub fn capitalize_first(s: &str) -> String {
    let mut chars = s.chars();
    let first = chars.next().unwrap_or_default().to_uppercase();
    first.to_string() + chars.as_str()
}

impl GithubActivityAggregator {
    pub fn new(repo_name: String) -> Self {
        Self {
            repo_name,
            counts: HashMap::new(),
            details: HashMap::new(),
            total_events: 0,
        }
    }

    pub fn aggregate(
        &mut self,
        event: &GithubActivityEventsResponse,
    ) -> Option<()> {
        let event_type = &event.r#type;
        let repo: &str = &self.repo_name;

        let detail = match event_type {
            GithubEventType::PushEvent => {
                let branch = event
                    .payload
                    .get("ref")?
                    .as_str()
                    .map(|str| str.strip_prefix("refs/heads/").unwrap_or("unknown"))?
                    .to_string();
                let msg = format!("Pushed to {repo}:{branch}");
                msg
            }
            GithubEventType::CreateEvent => {
                let ref_type = event.payload.get("ref_type")?.as_str().unwrap_or("unknown");
                let ref_name = event.payload.get("ref")?.as_str().unwrap_or("unknown");
                let msg = format!("Created {ref_type} {ref_name} in {repo}");
                msg
            }
            GithubEventType::DeleteEvent => {
                let ref_type = event.payload.get("ref_type")?.as_str().unwrap_or("unknown");
                let ref_name = event.payload.get("ref")?.as_str().unwrap_or("unknown");
                let msg = format!("Created {ref_type} {ref_name} in {repo}");
                msg
            }
            GithubEventType::IssuesEvent => {
                let action =
                    capitalize_first(event.payload.get("action")?.as_str().unwrap_or("performed"));
                let issue_number = event
                    .payload
                    .get("issue")
                    .and_then(|i| i.get("number"))
                    .and_then(|n| n.as_i64())
                    .unwrap_or(0);
                let title = event
                    .payload
                    .get("issue")
                    .and_then(|i| i.get("title"))
                    .and_then(|t| t.as_str())
                    .unwrap_or("");
                let msg = format!("{action} issue #{issue_number} \"{title}\" in {repo}");
                msg
            }
            GithubEventType::PullRequestEvent => {
                let action =
                    capitalize_first(event.payload.get("action")?.as_str().unwrap_or("performed"));
                let pr_number = event
                    .payload
                    .get("pull_request")
                    .and_then(|p| p.get("number"))
                    .and_then(|n| n.as_i64())
                    .unwrap_or(0);
                let msg = format!("{action} PR #{pr_number} in {repo}");
                msg
            }
            GithubEventType::ReleaseEvent => {
                let action =
                    capitalize_first(event.payload.get("action")?.as_str().unwrap_or("performed"));
                let tag = event
                    .payload
                    .get("release")
                    .and_then(|r| r.get("tag_name"))
                    .and_then(|t| t.as_str())
                    .unwrap_or("");
                let msg = format!("{action} release {tag} in {repo}");
                msg
            }
            GithubEventType::WatchEvent => {
                let action =
                    capitalize_first(event.payload.get("action")?.as_str().unwrap_or("performed"));
                let msg = format!("{action} watch in {repo}");
                msg
            }
            GithubEventType::ForkEvent => {
                let action =
                    capitalize_first(event.payload.get("action")?.as_str().unwrap_or("performed"));
                let msg = format!("{action} fork in {repo}");
                msg
            }

            _ => "unknown event".to_string(),
        };

        self.details
            .entry(event_type.clone())
            .or_insert(vec![])
            .push(detail);
        self.counts
            .entry(event_type.clone())
            .and_modify(|c| *c += 1)
            .or_insert(1);
        self.total_events += 1;
        Some(())
    }

    pub fn print_summary(&self) {
        println!("Total events: {}", self.total_events);
        for (event_type, count) in &self.counts {
            println!("  {:?}: {}", event_type, count);
            if let Some(details) = self.details.get(event_type) {
                for detail in details {
                    println!("    - {}", detail);
                }
            }
        }
    }
}

#[derive(Debug)]
pub struct GithubActivity {
    pub activities: Vec<GithubActivityEventsResponse>,
}

impl GithubActivity {
    pub fn load(github_user_name: &str) -> Result<Self, String> {
        let url = format!("https://api.github.com/users/{}/events", github_user_name);
        let body: String = ureq::get(url)
            .call()
            .map_err(|e| format!("Failed to send request: {:?}", e))?
            .body_mut()
            .read_to_string()
            .map_err(|e| format!("Failed to read request body: {:?}", e))?;

        let activities: Vec<GithubActivityEventsResponse> = serde_json::from_str(&body)
            .map_err(|e| format!("Failed to parse request body: {:?}", e))?;
        Ok(GithubActivity { activities })
    }

     fn aggregate(&self) -> HashMap<String, GithubActivityAggregator> {
        let mut aggregators = HashMap::<String, GithubActivityAggregator>::new();
        for activity in &self.activities {
            let repo_name = &activity.repo.name;
            let aggregator = aggregators
                .entry(repo_name.to_string())
                .or_insert(GithubActivityAggregator::new(repo_name.to_string()));
            aggregator.aggregate(activity);
        }
        aggregators
    }

    pub fn show(&self) {
        let aggregators = self.aggregate();
        for (repo_name, aggregator) in &aggregators {
            println!("Repository: {}", repo_name);
            aggregator.print_summary();
        }
    }
}
