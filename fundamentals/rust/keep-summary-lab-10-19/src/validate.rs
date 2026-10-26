use crate::secret::{HasCategory, Secret};

#[derive(Debug)]
pub enum ValidationError {
    EmptyTitle,
    ShortPassword,
    DuplicateService,
}

pub trait Validate {
    fn validate(&self) -> Result<(), ValidationError>;
}

impl<T: HasCategory + Validate> Validate for Secret<T> {
    fn validate(&self) -> Result<(), ValidationError> {
        // validate core element here
        self.value().validate()
    }
}
