/// File-based storage implementation

use std::fs;
use std::path::Path;
use crate::storage::Storage;
use tracing::{debug, error, warn};

/// File storage for persisting task data
pub struct FileStorage {
    path: String,
}

impl FileStorage {
    /// Creates a new FileStorage instance
    pub fn new(path: Option<String>) -> Self {
        let storage_path = path.unwrap_or_else(|| {
            format!("temp/{}", chrono::Local::now().timestamp_millis())
        });
        debug!("Initializing FileStorage with path: {}", storage_path);
        FileStorage { path: storage_path }
    }

    pub fn path(&self) -> &str {
        &self.path
    }
}

impl Storage for FileStorage {
    fn save(&self, data: String) -> Result<(), String> {
        // Create parent directories if they don't exist
        match fs::exists(&self.path) {
            Ok(exist) => {
                if !exist {
                    let path = Path::new(&self.path);
                    match fs::create_dir_all(path.parent().unwrap()) {
                        Ok(_) => {
                            debug!("Directory created: {}", self.path);
                        }
                        Err(e) => {
                            error!("Failed to create directory: {}", e);
                            return Err(format!("Failed to create directory: {}", e));
                        }
                    }
                }
            }
            Err(e) => {
                error!("File system error: {}", e);
                return Err(format!("File system error: {}", e));
            }
        }

        // Write data to file
        match fs::write(&self.path, data) {
            Ok(_) => {
                debug!("Data saved successfully to: {}", self.path);
                Ok(())
            }
            Err(e) => {
                error!("Failed to save data: {}", e);
                Err(format!("Failed to save data: {}", e))
            }
        }
    }

    fn load(&self) -> Result<String, String> {
        match fs::read_to_string(&self.path) {
            Ok(content) => {
                debug!("Data loaded from: {}", self.path);
                Ok(content)
            }
            Err(e) => {
                warn!("Failed to read file {}: {}", self.path, e);
                Err(format!("Failed to read file: {}", e))
            }
        }
    }
}
