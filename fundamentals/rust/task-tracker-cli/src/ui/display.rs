/// Display functions for rendering tasks in the terminal

use crate::task::Task;
use prettytable::{Table, row};
use tracing::info;

/// Displays a single task in a formatted table
pub fn display_task(task: &Task) {
    let mut table = Table::new();
    table.add_row(row!["ID", "Description", "Status", "Created At", "Updated At"]);
    table.add_row(row![
        task.id,
        task.description,
        task.status.to_string(),
        task.created_at.format("%Y-%m-%d %H:%M:%S"),
        task.updated_at.format("%Y-%m-%d %H:%M:%S")
    ]);
    table.printstd();
}

/// Displays all tasks in a formatted table
pub fn display_tasks(tasks: &[Task]) {
    if tasks.is_empty() {
        info!("No tasks to display");
        return;
    }

    let mut table = Table::new();
    table.add_row(row!["ID", "Description", "Status", "Created At", "Updated At"]);

    for task in tasks {
        table.add_row(row![
            task.id,
            task.description,
            task.status.to_string(),
            task.created_at.format("%Y-%m-%d %H:%M:%S"),
            task.updated_at.format("%Y-%m-%d %H:%M:%S")
        ]);
    }

    println!();
    table.printstd();
    println!();
}
