use crate::secret::{HasCategory, RiskLevel, Secret};

pub trait Auditable {
    fn resource_name(&self) -> &str;
    fn mask_value(&self) -> String;
    fn risk_level(&self) -> RiskLevel;
}

pub trait AuditablePayload {
    fn mask(&self) -> String;
    fn risk_level(&self) -> RiskLevel;
}

impl<T: AuditablePayload + HasCategory> Auditable for Secret<T> {
    fn resource_name(&self) -> &str {
        &self.core().service
    }
    fn mask_value(&self) -> String {
        self.value().mask()
    }
    fn risk_level(&self) -> RiskLevel {
        self.value().risk_level()
    }
}
