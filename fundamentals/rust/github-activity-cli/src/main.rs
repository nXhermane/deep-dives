use serde::Deserialize;
use std::str::FromStr;

use crate::github_activity::types::GithubActivityEventsResponse;


mod github_activity;

fn main() {
    let github_username = "nXhermane";
    let url = format!("https://api.github.com/users/{}/events", github_username);
    let body: String = ureq::get(url)
        .call()
        .unwrap()
        .body_mut()
        .read_to_string()
        .unwrap();
    let github_activity_event: Vec<GithubActivityEventsResponse> =
        serde_json::from_str(&body).unwrap();
    println!("Request Response : {:?}", github_activity_event);
    println!("Done!");
}
