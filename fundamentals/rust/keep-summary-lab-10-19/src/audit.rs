use crate::secret::{Environment, HasCategory, RiskLevel, Secret, Status};

pub struct AuditEntry {
    pub id: u64,
    pub service: String,
    pub env: Environment,
    pub status: Status,
    pub masked_value: String,
    pub risk_level: RiskLevel,
}

pub trait Auditable {
    fn resource_name(&self) -> &str;
    fn mask_value(&self) -> String;
    fn risk_level(&self) -> RiskLevel;
    fn audit_entry(&self) -> AuditEntry;
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
    fn audit_entry(&self) -> AuditEntry {
        let core = self.core();
        AuditEntry {
            id: core.id,
            service: core.service.clone(),
            env: core.env.clone(),
            status: core.status.clone(),
            masked_value: self.mask_value(),
            risk_level: self.risk_level(),
        }
    }
}
