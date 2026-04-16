/// Task status enumeration
use std::fmt;

#[derive(Debug, Clone, PartialEq)]
pub enum TaskStatus {
    ToDo,
    InProgress,
    Done,
}

impl fmt::Display for TaskStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            TaskStatus::ToDo => write!(f, "ToDo"),
            TaskStatus::InProgress => write!(f, "In Progress"),
            TaskStatus::Done => write!(f, "Done"),
        }
    }
}

impl TaskStatus {
    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "ToDo" => Some(TaskStatus::ToDo),
            "InProgress" => Some(TaskStatus::InProgress),
            "Done" => Some(TaskStatus::Done),
            _ => None,
        }
    }
}
