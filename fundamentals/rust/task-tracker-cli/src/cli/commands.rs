/// Command execution logic for CLI

use crate::task::TaskManager;
use crate::storage::{Storage, FileStorage};
use crate::ui::{display_task, display_tasks};
use crate::cli::TaskOperation;
use tracing::{info, error, debug};

/// Represents a command with its parameters
#[derive(Debug)]
pub struct TaskCommand {
    pub operation: TaskOperation,
    pub task_id: Option<u32>,
    pub description: Option<String>,
}

/// Executes a task command
pub fn execute_command(command: TaskCommand, storage_path: String) {
    let id_storage = FileStorage::new(Some("temp/id".to_string()));
    let task_storage = FileStorage::new(Some(storage_path));

    // Load tasks from storage
    let store_content = task_storage
        .load()
        .unwrap_or_else(|_| "[]".to_string());

    let current_id = id_storage
        .load()
        .unwrap_or_else(|_| "0".to_string())
        .parse::<u32>()
        .unwrap_or(0);

    debug!("Loading tasks (current_id={})", current_id);

    let mut manager = TaskManager::from_json_string(&store_content, current_id)
        .unwrap_or_else(|| TaskManager::new());

    // Execute the operation
    match command.operation {
        TaskOperation::Add => {
            if let Some(desc) = command.description {
                manager.add_task(desc.clone());
                info!("✓ Task added: \"{}\"", desc);
                if let Some(task) = manager.tasks.last() {
                    debug!("Task ID: {}", task.id);
                }
            } else {
                error!("❌ Error: Description required for adding a task");
            }
        }

        TaskOperation::Delete => {
            if let Some(id) = command.task_id {
                manager.remove_task(id);
                info!("✓ Task {} deleted", id);
                debug!("Remaining tasks: {}", manager.tasks.len());
            } else {
                error!("❌ Error: Task ID required for deletion");
            }
        }

        TaskOperation::MarkInProgress => {
            if let Some(id) = command.task_id {
                if let Some(task) = manager.get_task_mut(id) {
                    task.mark_in_progress();
                    info!("✓ Task {} marked as In Progress", id);
                    debug!("Task status updated at: {}", task.updated_at);
                } else {
                    error!("❌ Error: Task {} not found", id);
                }
            } else {
                error!("❌ Error: Task ID required");
            }
        }

        TaskOperation::MarkDone => {
            if let Some(id) = command.task_id {
                if let Some(task) = manager.get_task_mut(id) {
                    task.mark_done();
                    info!("✓ Task {} marked as Done", id);
                    debug!("Task status updated at: {}", task.updated_at);
                } else {
                    error!("❌ Error: Task {} not found", id);
                }
            } else {
                error!("❌ Error: Task ID required");
            }
        }

        TaskOperation::UpdateDesc => {
            if let Some(id) = command.task_id {
                if let Some(desc) = command.description {
                    if let Some(task) = manager.get_task_mut(id) {
                        let old_desc = task.description.clone();
                        task.update(desc.clone());
                        info!("✓ Task {} updated: \"{}\" → \"{}\"", id, old_desc, desc);
                        debug!("Task status updated at: {}", task.updated_at);
                    } else {
                        error!("❌ Error: Task {} not found", id);
                    }
                } else {
                    error!("❌ Error: Description required for update");
                }
            } else {
                error!("❌ Error: Task ID required");
            }
        }

        TaskOperation::Get => {
            if let Some(id) = command.task_id {
                if let Some(task) = manager.get_task(id) {
                    debug!("Retrieving task with ID: {}", id);
                    display_task(task);
                } else {
                    error!("❌ Error: Task {} not found", id);
                }
            } else {
                error!("❌ Error: Task ID required");
            }
        }

        TaskOperation::List => {
            debug!("Listing all tasks (Total: {})", manager.tasks.len());
            display_tasks(&manager.tasks);
        }
    }

    // Save tasks to storage
    let (task_data, id) = manager.to_json_string();
    let _ = id_storage.save(id.to_string());
    let _ = task_storage.save(task_data);
}
