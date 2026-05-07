
mod github_activity;
use github_activity::GithubActivity;

fn main() {
    let github_username = "nXhermane";
    let github_activity = GithubActivity::load(github_username);
    match github_activity {
        Ok(activity) => activity.show(),
        Err(e) => println!("Error: {}", e),
    }
}
