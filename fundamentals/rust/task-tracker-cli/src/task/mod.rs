/// Task module containing Task struct and TaskManager

pub mod manager;

pub use manager::TaskManager;

use chrono::{DateTime, Local};
use json::{JsonValue, object};
use crate::models::{TaskStatus, Serializable, Identifiable};
use tracing::debug;

/// Represents a single task
#[derive(Debug, Clone)]
pub struct Task {
    pub id: u32,
    pub description: String,
    pub status: TaskStatus,
    pub created_at: DateTime<Local>,
    pub updated_at: DateTime<Local>,
}

impl Task {
    /// Creates a new task with the given ID and description
    pub fn new(id: u32, desc: String) -> Self {
        debug!("Creating new task: id={}, desc=\"{}\"", id, desc);
        Task {
            id,
            description: desc,
            status: TaskStatus::ToDo,
            created_at: Local::now(),
            updated_at: Local::now(),
        }
    }

    /// Updates the task's timestamp
    fn update_timestamp(&mut self) {
        self.updated_at = Local::now();
    }

    /// Updates the task description
    pub fn update(&mut self, desc: String) {
        debug!("Updating task {}: \"{}\" → \"{}\"", self.id, self.description, desc);
        self.description = desc;
        self.update_timestamp();
    }

    /// Marks the task as in progress
    pub fn mark_in_progress(&mut self) {
        debug!("Marking task {} as In Progress", self.id);
        self.status = TaskStatus::InProgress;
        self.update_timestamp();
    }

    /// Marks the task as done
    pub fn mark_done(&mut self) {
        debug!("Marking task {} as Done", self.id);
        self.status = TaskStatus::Done;
        self.update_timestamp();
    }
}

impl Serializable for Task {
    fn to_json(&self) -> JsonValue {
        object! {
            "id" => self.id,
            "description" => self.description.clone(),
            "status" => self.status.to_string(),
            "created_at" => self.created_at.to_rfc3339(),
            "updated_at" => self.updated_at.to_rfc3339(),
        }
    }

    fn from_json(json: &JsonValue) -> Option<Self> {
        Some(Task {
            id: json["id"].as_u32()?,
            description: json["description"].as_str()?.to_string(),
            status: TaskStatus::from_str(json["status"].as_str()?)?,
            created_at: DateTime::parse_from_rfc3339(json["created_at"].as_str()?)
                .ok()?
                .with_timezone(&Local),
            updated_at: DateTime::parse_from_rfc3339(json["updated_at"].as_str()?)
                .ok()?
                .with_timezone(&Local),
        })
    }
}

impl Identifiable for Task {
    fn get_id(&self) -> u32 {
        self.id
    }
}
