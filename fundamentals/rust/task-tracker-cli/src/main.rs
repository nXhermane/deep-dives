/// Task Tracker CLI - Main Entry Point

use task_tracker_cli::cli::{TaskCommand, TaskOperation, execute_command};
use tracing::info;

fn main() {
    // Initialize logging
    let log_level = std::env::var("RUST_LOG")
        .unwrap_or_else(|_| "info".to_string());

    tracing_subscriber::fmt()
        .with_env_filter(log_level)
        .with_target(true)
        .with_thread_ids(false)
        .with_line_number(false)
        .init();

    info!("Starting Task Tracker CLI");

    let storage_path = std::env::var("TASKS_STORE_PATH")
        .unwrap_or_else(|_| "temp/tasks".to_string());
    
    let args: Vec<String> = std::env::args().collect();

    if args.len() < 2 {
        print_help();
        return;
    }

    let command_str = &args[1];

    let command = match command_str.as_str() {
        "add" => {
            let description = args.get(2).map(|s| s.clone());
            TaskCommand {
                operation: TaskOperation::Add,
                task_id: None,
                description,
            }
        }
        "remove" => {
            let task_id = args.get(2).and_then(|s| s.parse::<u32>().ok());
            TaskCommand {
                operation: TaskOperation::Delete,
                task_id,
                description: None,
            }
        }
        "mark-in-progress" => {
            let task_id = args.get(2).and_then(|s| s.parse::<u32>().ok());
            TaskCommand {
                operation: TaskOperation::MarkInProgress,
                task_id,
                description: None,
            }
        }
        "done" => {
            let task_id = args.get(2).and_then(|s| s.parse::<u32>().ok());
            TaskCommand {
                operation: TaskOperation::MarkDone,
                task_id,
                description: None,
            }
        }
        "edit" => {
            let task_id = args.get(2).and_then(|s| s.parse::<u32>().ok());
            let description = args.get(3).map(|s| s.clone());
            TaskCommand {
                operation: TaskOperation::UpdateDesc,
                task_id,
                description,
            }
        }
        "get" => {
            let task_id = args.get(2).and_then(|s| s.parse::<u32>().ok());
            TaskCommand {
                operation: TaskOperation::Get,
                task_id,
                description: None,
            }
        }
        "list" => {
            TaskCommand {
                operation: TaskOperation::List,
                task_id: None,
                description: None,
            }
        }
        "help" => {
            print_help();
            return;
        }
        _ => {
            println!(
                "Unknown command: {}. Use 'help' for usage instructions.",
                command_str
            );
            return;
        }
    };

    execute_command(command, storage_path);
}

fn print_help() {
    println!("Usage: task-tracker-cli <command> [options]");
    println!();
    println!("Commands:");
    println!("  add <description>           - Add a new task");
    println!("  remove <id>                 - Remove a task");
    println!("  mark-in-progress <id>       - Mark task as in progress");
    println!("  done <id>                   - Mark task as done");
    println!("  edit <id> <description>     - Edit task description");
    println!("  get <id>                    - Get task details");
    println!("  list                        - List all tasks");
    println!("  help                        - Show this help message");
}
