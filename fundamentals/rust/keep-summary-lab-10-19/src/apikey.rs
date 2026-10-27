use crate::{
    audit::AuditablePayload,
    secret::{Category, HasCategory, RiskLevel, Secret},
    validate::{Validate, ValidationError},
};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ApiScope {
    ReadOnly,
    ReadWrite,
    Admin,
}

pub struct ApiKeyPayload {
    key: String,
    scopes: Vec<ApiScope>,
}

impl ApiKeyPayload {
    pub fn new(key: String, scopes: Vec<ApiScope>) -> Self {
        ApiKeyPayload {
            key: key.trim().to_string(),
            scopes,
        }
    }
}

impl HasCategory for ApiKeyPayload {
    const CATEGORY: Category = Category::Api;
}

#[derive(Debug)]
pub enum ApiKeyValidationError {
    TooShort,
    InvalidFormat,
    EmptyScope,
}

impl From<ApiKeyValidationError> for ValidationError {
    fn from(error: ApiKeyValidationError) -> Self {
        match error {
            ApiKeyValidationError::TooShort => ValidationError::new("Api key is too short"),
            ApiKeyValidationError::InvalidFormat => {
                ValidationError::new("Invalid api key format. (missing prefix or incorrect)")
            }
            ApiKeyValidationError::EmptyScope => {
                ValidationError::new("Api key can't have empty scope")
            }
        }
    }
}

impl Validate for ApiKeyPayload {
    fn validate(&self) -> Result<(), ValidationError> {
        let trimmed = self.key.trim();
        if trimmed.len() < 27 {
            return Err(ApiKeyValidationError::TooShort.into());
        }

        let sep_pos = trimmed
            .find(|c| c == '_' || c == '-')
            .ok_or(ApiKeyValidationError::InvalidFormat)?;

        let prefix = &trimmed[..sep_pos];
        let body = &trimmed[sep_pos + 1..];

        if !(2..=12).contains(&prefix.len()) || !prefix.chars().all(|c| c.is_ascii_alphanumeric()) {
            return Err(ApiKeyValidationError::InvalidFormat.into());
        }

        if !(24..=64).contains(&body.len())
            || !body
                .chars()
                .all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '-')
        {
            return Err(ApiKeyValidationError::InvalidFormat.into());
        }

        if self.scopes.is_empty() {
            return Err(ApiKeyValidationError::EmptyScope.into());
        }

        Ok(())
    }
}

impl AuditablePayload for ApiKeyPayload {
    fn mask(&self) -> String {
        // let mut is_not_underscore = false;
        // let (prefix, body) = self
        //     .key
        //     .split_once('_')
        //     .or_else(|| {
        //         is_not_underscore = true;
        //         return self.key.split_once('-');
        //     })
        //     .unwrap_or(("", &self.key));

        // let last_4 = &body[body.len() - 4..]; // on peut obtenir une panic ici
        // let masked_body = "*".repeat(body.len() - 4);
        // format!(
        //     "{}{}{}{}",
        //     prefix,
        //     if is_not_underscore { '-' } else { '_' },
        //     masked_body,
        //     last_4
        // )
        // or
        if let Some(pos) = self.key.find(|c| c == '_' || c == '-') {
            let prefix = &self.key[..pos];
            let sep = &self.key[pos..=pos];
            let body = &self.key[pos + 1..];

            if body.len() <= 4 {
                format!("{}{}{}", prefix, sep, "*".repeat(body.len()))
            } else {
                let last_4 = &body[body.len() - 4..];
                let masked_body = "*".repeat(body.len() - 4);
                format!("{}{}{}{}", prefix, sep, masked_body, last_4)
            }
        } else {
            "*".repeat(self.key.len())
        }
    }

    fn risk_level(&self) -> crate::secret::RiskLevel {
        if self.scopes.contains(&ApiScope::Admin) {
            return RiskLevel::High;
        }

        if self.scopes.contains(&ApiScope::ReadWrite) {
            return RiskLevel::Medium;
        }

        RiskLevel::Low
    }
}

pub type ApiKeySecret = Secret<ApiKeyPayload>;
