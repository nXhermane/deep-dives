use serde::Deserialize;
use std::collections::HashMap;
use std::str::FromStr;

#[derive(Deserialize, Debug)]
pub struct GithubActivityActor {
    id: i32,
    pub login: String,
    pub display_login: String,
    pub url: String,
}

#[derive(Deserialize, Debug)]
pub struct GithubActivityRepo {
    id: i32,
    pub name: String,
    pub url: String,
}
#[derive(Debug, Clone, PartialEq, Deserialize, Hash, Eq)]
pub enum GithubEventType {
    PushEvent,
    CreateEvent,
    DeleteEvent,
    IssuesEvent,
    WatchEvent,
    PullRequestEvent,
    ReleaseEvent,
    ForkEvent,
}

impl FromStr for GithubEventType {
    type Err = String;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "PushEvent" => Ok(GithubEventType::PushEvent),
            "CreateEvent" => Ok(GithubEventType::CreateEvent),
            "DeleteEvent" => Ok(GithubEventType::DeleteEvent),
            "IssuesEvent" => Ok(GithubEventType::IssuesEvent),
            "WatchEvent" => Ok(GithubEventType::WatchEvent),
            "PullRequestEvent" => Ok(GithubEventType::PullRequestEvent),
            "ReleaseEvent" => Ok(GithubEventType::ReleaseEvent),
            "ForkEvent" => Ok(GithubEventType::ForkEvent),
            _ => Err(format!("Unknown GitHub event type: {}", s)),
        }
    }
}

#[derive(Deserialize, Debug)]
pub struct GithubActivityEventsResponse {
    pub id: String,
    pub r#type: GithubEventType,
    pub actor: GithubActivityActor,
    pub repo: GithubActivityRepo,
    pub payload: serde_json::Value,
    pub created_at: Option<String>,
}

#[derive(Debug)]
pub struct GithubActivityAggregator {
    pub repo_name: String,
    pub counts: HashMap<GithubEventType, i32>,
    pub details: HashMap<GithubEventType, Vec<String>>,
    pub total_events: i32,
}
