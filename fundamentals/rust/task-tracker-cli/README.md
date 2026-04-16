# [rust-task-tracker_cli](https://github.com/nXhermane/rust_task-tracker_cli)

A lightweight, fast Rust command-line task tracker for managing TODOs and simple tasks locally. Designed to be minimal, scriptable, and user-friendly with beautiful formatted output.

## Features
- ✅ Add, list, complete, edit, and remove tasks
- 📁 Persistent local storage (JSON)
- 🎨 Beautiful formatted table output
- 📊 Colored logging (debug, info, warn, error)
- 🚀 Fast and lightweight
- 📝 Human-readable output for piping and scripting

## Requirements
- [Task Tracker Exercice](https://roadmap.sh/projects/task-tracker) 
- Rust toolchain (rustc + cargo) — https://rustup.rs

## Installation
Clone and build locally:
```bash
git clone https://github.com/nXhermane/task-tracker-cli.git
cd task-tracker-cli
cargo build --release
# optional: install to cargo bin directory
cargo install --path .
```

## Quick start

### Add a task
```bash
cargo run -- add "Buy groceries"
```

### List all tasks
```bash
cargo run -- list
```

### Mark a task in progress
```bash
cargo run -- mark-in-progress 1
```

### Mark a task as done
```bash
cargo run -- done 1
```

### Remove a task
```bash
cargo run -- remove 1
```

### Edit a task description
```bash
cargo run -- edit 1 "Read Rust book chapter 7"
```

### Get a specific task
```bash
cargo run -- get 1
```

## Storage
Tasks are stored in a simple local file (e.g., `temp/tasks.json` or a user data directory). The format is human-readable JSON to allow manual edits and easy interoperability.

## Logging & Output

### Production mode (minimal logs)
```bash
cargo run -- list
```

### Debug mode (detailed logs)
```bash
RUST_LOG=debug cargo run -- add "My task"
```

### Log levels
```bash
RUST_LOG=trace cargo run -- list     # Very detailed
RUST_LOG=debug cargo run -- list     # Technical details
RUST_LOG=info cargo run -- list      # Info/warn/error only (default)
```

## Project Structure
```
src/
├── lib.rs                  # Library root with module declarations
├── main.rs                 # CLI entry point and command parsing
├── models/
│   ├── mod.rs             # Model traits (Serializable, Identifiable)
│   └── task_status.rs     # TaskStatus enum
├── task/
│   ├── mod.rs             # Task struct and Serializable impl
│   └── manager.rs         # TaskManager and IdGenerator structs
├── storage/
│   ├── mod.rs             # Storage trait definition
│   └── file_storage.rs    # FileStorage implementation
├── ui/
│   ├── mod.rs             # UI module
│   └── display.rs         # display_task and display_tasks functions
└── cli/
    ├── mod.rs             # CLI types (TaskOperation, TaskCommand)
    └── commands.rs        # Command execution logic
```

### Module Organization

- **models**: Data structures and traits
- **task**: Core task management logic
- **storage**: File persistence abstraction
- **ui**: User interface / display formatting
- **cli**: Command-line interface and execution

## Testing & Linting
Run tests:
```bash
cargo test
```

Format and lint:
```bash
cargo fmt
cargo clippy -- -D warnings
```

## Dependencies
- **chrono** - Date/time handling
- **json** - JSON parsing and serialization
- **prettytable-rs** - Beautiful table formatting
- **tracing** - Structured logging
- **tracing-subscriber** - Log filtering and formatting

## Contributing
- Fork the repo, create a branch, and open a pull request.
- Follow idiomatic Rust and include tests for new behavior.
- Keep changes small and focused.

## License
Licensed MIT. See [LICENSE](./LICENSE) file for details.

## Roadmap
- 🔍 Search and filter by status or text
- 📤 Export/import tasks
- ⭐ Add priority and due-date metadata
- 🔄 Subcommands for recurring tasks
- ☁️ Sync backend (optional)
- 📱 Interactive mode (planned)

## Questions or feature requests
Open an issue in the repository.
