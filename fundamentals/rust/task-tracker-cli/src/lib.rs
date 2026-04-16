/// Task Tracker CLI Library
/// 
/// This library provides the core functionality for a command-line task manager.

pub mod models;
pub mod task;
pub mod storage;
pub mod ui;
pub mod cli;

// Re-export commonly used types
pub use models::{TaskStatus};
pub use task::{Task, TaskManager};
pub use storage::{Storage, FileStorage};
pub use ui::{display_task, display_tasks};
