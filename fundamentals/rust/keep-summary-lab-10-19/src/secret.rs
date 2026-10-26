use crate::lib::SimpleDate;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Environment {
    Dev,
    Prod,
    Test,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Status {
    Enable,
    Disable,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Category {
    Password,
    Api,
    Token,
}

#[derive(Debug, Clone)]
pub struct CoreSecret {
    pub id: u64,
    pub service: String,
    pub title: String,
    pub env: Environment,
    pub status: Status,
    pub access_count: u64,
    pub expires_at: Option<SimpleDate>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Ord, PartialOrd)]
pub enum RiskLevel {
    Low,
    Medium,
    High,
}

pub trait HasCategory {
    const CATEGORY: Category;
}

pub struct Secret<T: HasCategory> {
    core: CoreSecret,
    value: T,
}

impl<T: HasCategory> Secret<T> {
    /// constructeur
    pub fn new(core: CoreSecret, value: T) -> Self {
        Self { core, value }
    }

    pub fn core(&self) -> &CoreSecret {
        &self.core
    }

    pub fn value(&self) -> &T {
        &self.value
    }
    pub fn category(&self) -> Category {
        T::CATEGORY
    }
}
