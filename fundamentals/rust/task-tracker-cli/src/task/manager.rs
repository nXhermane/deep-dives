/// Task Manager for managing multiple tasks

use crate::task::Task;
use crate::models::Serializable;
use tracing::debug;
use json::JsonValue;

/// Helper struct for generating unique task IDs
#[derive(Debug)]
pub struct IdGenerator {
    current_id: u32,
}

impl IdGenerator {
    pub fn new(start_value: Option<u32>) -> Self {
        IdGenerator {
            current_id: start_value.unwrap_or(0),
        }
    }

    pub fn generate(&mut self) -> u32 {
        self.current_id += 1;
        debug!("Generated new task ID: {}", self.current_id);
        self.current_id
    }

    pub fn current(&self) -> u32 {
        self.current_id
    }
}

/// Manages a collection of tasks
#[derive(Debug)]
pub struct TaskManager {
    pub tasks: Vec<Task>,
    id_generator: IdGenerator,
}

impl TaskManager {
    /// Creates a new empty TaskManager
    pub fn new() -> Self {
        debug!("Creating new TaskManager");
        TaskManager {
            tasks: Vec::new(),
            id_generator: IdGenerator::new(None),
        }
    }

    /// Adds a new task with the given description
    pub fn add_task(&mut self, desc: String) {
        let task = Task::new(self.id_generator.generate(), desc);
        self.tasks.push(task);
    }

    /// Retrieves a task by ID (immutable)
    pub fn get_task(&self, id: u32) -> Option<&Task> {
        self.tasks.iter().find(|&task| task.id == id)
    }

    /// Retrieves a task by ID (mutable)
    pub fn get_task_mut(&mut self, id: u32) -> Option<&mut Task> {
        self.tasks.iter_mut().find(|task| task.id == id)
    }

    /// Removes a task by ID
    pub fn remove_task(&mut self, id: u32) {
        debug!("Removing task {}", id);
        self.tasks.retain(|task| task.id != id);
    }

    /// Converts all tasks to a JSON string and returns current ID
    pub fn to_json_string(&self) -> (String, u32) {
        let json_array = self
            .tasks
            .iter()
            .map(|t| t.to_json())
            .collect::<Vec<_>>();
        (
            JsonValue::Array(json_array).to_string(),
            self.id_generator.current(),
        )
    }

    /// Creates a TaskManager from a JSON string with the given current ID
    pub fn from_json_string(json_str: &str, current_id: u32) -> Option<Self> {
        let parsed = json::parse(json_str).ok()?;
        let mut tasks = Vec::new();
        for item in parsed.members() {
            if let Some(task) = Task::from_json(item) {
                tasks.push(task);
            }
        }
        debug!("Loaded {} tasks from JSON", tasks.len());
        Some(TaskManager {
            tasks,
            id_generator: IdGenerator::new(Some(current_id)),
        })
    }
}

impl Default for TaskManager {
    fn default() -> Self {
        Self::new()
    }
}
