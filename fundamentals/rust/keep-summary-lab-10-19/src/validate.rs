use crate::secret::{HasCategory, Secret};

#[derive(Debug)]
pub enum ValidationError {
    EmptyTitle,
    EmptyServiceName,
    Custom(String),
}

impl ValidationError {
    pub fn new(msg: &str) -> Self {
        ValidationError::Custom(msg.to_string())
    }
}

pub trait Validate {
    fn validate(&self) -> Result<(), ValidationError>;
}

impl<T: HasCategory + Validate> Validate for Secret<T> {
    fn validate(&self) -> Result<(), ValidationError> {
        // validate core element here
        if self.core().title.trim().is_empty() {
            return Err(ValidationError::EmptyTitle);
        }

        if self.core().service.trim().is_empty() {
            return Err(ValidationError::EmptyServiceName);
        }

        self.value().validate()
    }
}
