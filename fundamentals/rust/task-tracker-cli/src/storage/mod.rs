/// Storage abstraction for persisting and loading data

pub mod file_storage;

pub use file_storage::FileStorage;

/// Trait for implementing storage backends
pub trait Storage {
    fn save(&self, data: String) -> Result<(), String>;
    fn load(&self) -> Result<String, String>;
}
