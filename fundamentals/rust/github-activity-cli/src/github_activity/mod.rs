use ureq::Error;

use crate::github_activity::types::GithubActivityEventsResponse;

pub mod types;
pub struct GithubActivity {
    pub activities: Vec<GithubActivityEventsResponse>,
}
impl GithubActivity {
    pub fn load(github_user_name: &str) -> Result<Self, Error> {
        let url = format!("https://api.github.com/users/{}/events", github_user_name);
        let body: String = ureq::get(url).call()?.body_mut().read_to_string()?;

        Ok(GithubActivity {
            activities: serde_json::from_str(&body)?,
        })
    }
}
