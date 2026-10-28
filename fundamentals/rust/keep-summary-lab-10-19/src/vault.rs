use std::collections::HashMap;

use crate::{
    audit::{AuditEntry, Auditable, AuditablePayload},
    reveal::{
        Auth::{self, Admin},
        RevealablePayload,
    },
    secret::{
        Category, CoreSecret, Environment, HasCategory, Secret,
        Status::{self, Disable, Enable},
    },
    time::SimpleDate,
    validate::{Validate, ValidationError},
};

#[derive(Debug)]
pub enum VaultError {
    NotFound(SearchKey),
    DuplicateId,
    InvalidData,
    PermissionDenied,
    OperationFailed,
    Validation(ValidationError),
}
#[derive(Debug)]
pub enum SearchKey {
    Id(u64),
    Service(String),
}

impl From<ValidationError> for VaultError {
    fn from(err: ValidationError) -> Self {
        VaultError::Validation(err)
    }
}

#[derive(Debug, Default, Clone)]
pub struct SecretUpdate {
    pub service: Option<String>,
    pub title: Option<String>,
    pub env: Option<Environment>,
    pub expires_at: Option<Option<SimpleDate>>,
}

/// Jeton interne non instanciable en dehors de ce module (champ privé).
/// Garantit que seules les méthodes du Vault peuvent autoriser l'accès et la révélation.
pub struct InternalToken {
    _private: (),
}

pub trait VaultElementTrait: Auditable + Validate {
    fn core(&self) -> &CoreSecret;
    fn category(&self) -> Category;
    fn apply_update(&mut self, update: &SecretUpdate) -> ();
    fn enable(&mut self) -> ();
    fn disable(&mut self) -> ();
    fn internal_reveal(&self, _token: &InternalToken) -> String;
    fn internal_access(&mut self, _token: &InternalToken) -> ();
}

impl<T: AuditablePayload + HasCategory + Validate + RevealablePayload> VaultElementTrait
    for Secret<T>
{
    fn core(&self) -> &CoreSecret {
        Secret::core(self)
    }

    fn category(&self) -> Category {
        Secret::category(self)
    }

    fn apply_update(&mut self, update: &SecretUpdate) {
        if let Some(service) = &update.service {
            self.core_mut().service = service.clone();
        }
        if let Some(title) = &update.title {
            self.core_mut().title = title.clone();
        }
        if let Some(env) = &update.env {
            self.core_mut().env = env.clone();
        }
        if let Some(expire_at) = &update.expires_at {
            self.core_mut().expires_at = expire_at.clone();
        }
    }

    fn disable(&mut self) -> () {
        self.core_mut().status = Disable;
    }

    fn enable(&mut self) -> () {
        self.core_mut().status = Enable;
    }

    fn internal_reveal(&self, _token: &InternalToken) -> String {
        RevealablePayload::reveal_value(self)
    }

    fn internal_access(&mut self, _token: &InternalToken) -> () {
        self.core_mut().access_count += 1;
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

    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            secrets: Vec::with_capacity(capacity),
            secret_index: HashMap::new(),
            next_id: 0,
        }
    }

    // stats
    pub fn next_id(&self) -> u64 {
        self.next_id
    }

    pub fn len(&self) -> usize {
        self.secrets.len()
    }

    pub fn capacity(&self) -> usize {
        self.secrets.capacity()
    }

    pub fn is_empty(&self) -> bool {
        self.secrets.is_empty()
    }

    // adding / basic searching
    pub fn add<T>(&mut self, secret: Secret<T>) -> Result<(), VaultError>
    where
        T: AuditablePayload + HasCategory + Validate + RevealablePayload + 'static,
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

    pub fn get_by_id(&self, id: u64) -> Option<&dyn VaultElementTrait> {
        // self.secrets
        //     .iter()
        //     .find(|secret| secret.core().id == id)
        //     .map(|boxed| boxed.as_ref())
        //     .ok_or(VaultError::NotFound);
        // or
        let maybe_secret = self.secrets.iter().find(|secret| secret.core().id == id);

        if let Some(boxed_secret) = maybe_secret {
            Some(boxed_secret.as_ref())
        } else {
            None
        }
    }

    pub fn get_by_service(&self, service: &str) -> Vec<&dyn VaultElementTrait> {
        // let indices = self.secret_index.get(service);
        // if let Some(indices) = indices {
        //     indices.iter().map(|&i| self.secrets[i].as_ref()).collect()
        // } else {
        //     Vec::new()
        // }
        // or
        self.secret_index
            .get(service)
            .map(|v| v.iter().map(|&i| self.secrets[i].as_ref()).collect())
            .unwrap_or_default()
    }

    // mutations
    pub fn enable(&mut self, id: u64) -> Result<(), VaultError> {
        let secret = self
            .get_by_id_mut(id)
            .ok_or(VaultError::NotFound(SearchKey::Id(id)))?;
        secret.enable();
        Ok(())
    }

    pub fn disable(&mut self, id: u64) -> Result<(), VaultError> {
        let secret = self
            .get_by_id_mut(id)
            .ok_or(VaultError::NotFound(SearchKey::Id(id)))?;
        secret.disable();
        Ok(())
    }

    pub fn delete(&mut self, id: u64) -> Result<(), VaultError> {
        let idx = self
            .secrets
            .iter()
            .position(|s| s.core().id == id)
            .ok_or(VaultError::NotFound(SearchKey::Id(id)))?;

        let removed_service = self.secrets[idx].core().service.clone();
        let last_idx = self.secrets.len() - 1;

        self.secrets.swap_remove(idx);

        if let Some(indices) = self.secret_index.get_mut(&removed_service) {
            indices.retain(|&i| i != idx);
        }

        if idx != last_idx {
            let swapped_service = self.secrets[idx].core().service.clone();
            if let Some(indices) = self.secret_index.get_mut(&swapped_service) {
                for i in indices.iter_mut() {
                    if *i == last_idx {
                        *i = idx;
                        break;
                    }
                }
            }
        }
        Ok(())
    }

    pub fn update_secret(&mut self, id: u64, update: &SecretUpdate) -> Result<(), VaultError> {
        let secret = self
            .get_by_id_mut(id)
            .ok_or(VaultError::NotFound(SearchKey::Id(id)))?;

        if let Some(title) = &update.title {
            if title.trim().is_empty() {
                return Err(VaultError::Validation(ValidationError::EmptyTitle));
            }
        }
        if let Some(ref service) = update.service {
            if service.trim().is_empty() {
                return Err(VaultError::Validation(ValidationError::EmptyServiceName));
            }
        }

        secret.apply_update(update);
        Ok(())
    }

    // security
    pub fn reveal_secret(&mut self, id: u64, auth: &Auth) -> Result<String, VaultError> {
        if auth != &Admin {
            return Err(VaultError::PermissionDenied);
        }

        let secret = self
            .get_by_id_mut(id)
            .ok_or(VaultError::NotFound(SearchKey::Id(id)))?;

        if secret.core().status == Disable {
            return Err(VaultError::OperationFailed);
        }

        let token = InternalToken { _private: () };
        secret.internal_access(&token);

        Ok(secret.internal_reveal(&token))
    }

    // avancy searching
    pub fn find_first<F>(&self, predicate: F) -> Option<&dyn VaultElementTrait>
    where
        F: Fn(&dyn VaultElementTrait) -> bool,
    {
        for boxed in &self.secrets {
            if predicate(boxed.as_ref()) {
                return Some(boxed.as_ref());
            }
        }
        None
    }

    pub fn filter(&self, filter: &SecretFilter) -> Vec<&dyn VaultElementTrait> {
        self.secrets
            .iter()
            .map(|boxed| boxed.as_ref())
            .filter(|secret| filter.matches(*secret))
            .collect()
    }

    // pub fn iter(&self) -> impl Iterator<Item = &dyn VaultElementTrait> {
    //     todo!()
    // }

    pub fn audit_production_active(&self) -> Vec<AuditEntry> {
        self.filter(&SecretFilter {
            env: Some(Environment::Prod),
            status: Some(Status::Enable),
            ..Default::default()
        })
        .iter()
        .map(|s| s.audit_entry())
        .collect()
    }

    pub fn distint_service(&self) -> Vec<String> {
        self.secret_index
            .keys()
            .into_iter()
            .map(|s| s.clone())
            .collect()
    }

    pub fn group_by_environment(&self) -> HashMap<Environment, Vec<&dyn VaultElementTrait>> {
        let mut grouped_by_env: HashMap<Environment, Vec<&dyn VaultElementTrait>> = HashMap::new();

        for secret in &self.secrets {
            grouped_by_env
                .entry(secret.core().env)
                .or_default()
                .push(secret.as_ref());
        }

        grouped_by_env
    }

    // private methods
    fn get_by_id_mut(&mut self, id: u64) -> Option<&mut (dyn VaultElementTrait + '_)> {
        self.secrets
            .iter_mut()
            .find(|secret| secret.core().id == id)
            .map(|boxed| &mut **boxed as &mut dyn VaultElementTrait)
    }
}

#[derive(Debug, Default, Clone)]
pub struct SecretFilter {
    pub env: Option<Environment>,
    pub status: Option<Status>,
    pub category: Option<Category>,
    pub service: Option<String>,
    pub has_expiration: Option<bool>,
}

impl SecretFilter {
    pub fn matches(&self, secret: &dyn VaultElementTrait) -> bool {
        if let Some(env) = self.env {
            if secret.core().env != env {
                return false;
            }
        }
        if let Some(status) = self.status {
            if secret.core().status != status {
                return false;
            }
        }
        if let Some(category) = self.category {
            if secret.category() != category {
                return false;
            }
        }
        if let Some(ref service) = self.service {
            if &secret.core().service != service {
                return false;
            }
        }
        if let Some(has_exp) = self.has_expiration {
            if secret.core().expires_at.is_some() != has_exp {
                return false;
            }
        }
        true
    }
}
