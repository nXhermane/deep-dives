use crate::secret::{HasCategory, Secret};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Auth {
    Admin,
    Auditor,
}

pub trait RevealablePayload {
    fn reveal_value(&self) -> String;
}

impl<T: HasCategory + RevealablePayload> RevealablePayload for Secret<T> {
    fn reveal_value(&self) -> String {
        self.value().reveal_value()
    }
}
