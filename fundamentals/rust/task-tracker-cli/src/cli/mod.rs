/// CLI operations and command execution

pub mod commands;

pub use commands::{TaskCommand, execute_command};

/// Represents CLI operations
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TaskOperation {
    Add,
    Delete,
    MarkInProgress,
    MarkDone,
    UpdateDesc,
    Get,
    List,
}
