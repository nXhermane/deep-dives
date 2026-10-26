use std::collections::{hash_map, HashMap};

use crate::{
    audit::{Auditable, AuditablePayload},
    secret::{self, CoreSecret, HasCategory, Secret},
    validate::{Validate, ValidationError},
};

#[derive(Debug)]
pub enum VaultError {
    NotFound,
    DuplicateId,
    InvalidData,
    PermissionDenied,
    OperationFailed,
    Validation(ValidationError),
}

impl From<ValidationError> for VaultError {
    fn from(err: ValidationError) -> Self {
        VaultError::Validation(err)
    }
}

trait VaultElementTrait: Auditable + Validate {
    fn core(&self) -> &CoreSecret;
}

impl<T: AuditablePayload + HasCategory + Validate> VaultElementTrait for Secret<T> {
    fn core(&self) -> &CoreSecret {
        Secret::core(self)
    }
}

pub struct Vault {
    secrets: Vec<Box<dyn VaultElementTrait>>,
    secret_index: HashMap<String, Vec<usize>>,
    next_id: u64,
}

impl Vault {
    pub fn new() -> Self {
        Self {
            secrets: Vec::new(),
            secret_index: HashMap::new(),
            next_id: 0,
        }
    }

    pub fn add<T>(&mut self, secret: Secret<T>) -> Result<(), VaultError>
    where
        T: AuditablePayload + HasCategory + Validate + 'static,
    {
        // verifie id invariant
        if self.next_id == secret.core().id {
            return Err(VaultError::InvalidData);
        }
        // validate secret and unwrap error
        secret.validate()?;

        self.secrets.push(Box::new(secret));

        let idx = self.secrets.len() - 1;
        // index service
        self.secret_index
            .entry(self.secrets[idx].resource_name().to_string())
            // .and_modify(|indexs| indexs.push(idx))
            // .or_insert(vec![idx]);
            // or
            .or_default()
            .push(idx);

        self.next_id += 1;
        Ok(())
    }

    pub fn get_by_id(&self, id: u64) -> Result<&dyn VaultElementTrait, VaultError> {
        // self.secrets
        //     .iter()
        //     .find(|secret| secret.core().id == id)
        //     .map(|boxed| boxed.as_ref())
        //     .ok_or(VaultError::NotFound);
        // or
        let maybe_secret = self.secrets.iter().find(|secret| secret.core().id == id);

        if let Some(boxed_secret) = maybe_secret {
            Ok(boxed_secret.as_ref())
        } else {
            Err(VaultError::NotFound)
        }
    }

    pub fn get_next_id(&self) -> u64 {
        self.next_id
    }
}
