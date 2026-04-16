/// Task models and data structures

pub mod task_status;

pub use task_status::TaskStatus;

/// Trait for serializable types
pub trait Serializable {
    fn to_json(&self) -> json::JsonValue;
    fn from_json(json: &json::JsonValue) -> Option<Self>
    where
        Self: Sized;
}

/// Trait for types with unique identifiers
pub trait Identifiable {
    fn get_id(&self) -> u32;
}
