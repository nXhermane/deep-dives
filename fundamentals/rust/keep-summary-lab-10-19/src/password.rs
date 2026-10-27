use crate::{
    audit::AuditablePayload,
    secret::{Category, HasCategory, RiskLevel, Secret},
    validate::{Validate, ValidationError},
};

pub struct PasswordPayload {
    raw: String,
}

impl HasCategory for PasswordPayload {
    const CATEGORY: Category = Category::Password;
}

#[derive(Debug)]
pub enum PasswordValidationError {
    TooShort,
    MissingNumeric,
    MissingAphabetic,
}

impl From<PasswordValidationError> for ValidationError {
    fn from(error: PasswordValidationError) -> Self {
        match error {
            PasswordValidationError::TooShort => ValidationError::new("Password is too short"),
            PasswordValidationError::MissingNumeric => {
                ValidationError::new("Password missing numeric character")
            }
            PasswordValidationError::MissingAphabetic => {
                ValidationError::new("Password missing alphabetic character")
            }
        }
    }
}

impl Validate for PasswordPayload {
    ///
    /// @invariant
    /// - The password lenght must be greater than or equal to eight
    /// - The password must also contain a numeric character and alphabetic characters
    fn validate(&self) -> Result<(), ValidationError> {
        let trimmed = self.raw.trim();
        if trimmed.len() < 8 {
            return Err(PasswordValidationError::TooShort.into());
        }
        if !trimmed.chars().any(|c| c.is_numeric()) {
            return Err(PasswordValidationError::MissingNumeric.into());
        }
        if !trimmed.chars().any(|c| c.is_alphabetic()) {
            return Err(PasswordValidationError::MissingAphabetic.into());
        }
        Ok(())
    }
}

impl AuditablePayload for PasswordPayload {
    fn mask(&self) -> String {
        "*".repeat(self.raw.len())
    }

    fn risk_level(&self) -> RiskLevel {
        let len = self.raw.len();
        let has_upper = self.raw.chars().any(|c| c.is_uppercase());
        let has_lower = self.raw.chars().any(|c| c.is_lowercase());
        let has_number = self.raw.chars().any(|c| c.is_numeric());
        let has_special = self.raw.chars().any(|c| !c.is_alphanumeric());

        let diversity_score = [has_upper, has_lower, has_number, has_special]
            .iter()
            .filter(|&&present| present)
            .count();

        if len < 10 || diversity_score <= 2 {
            RiskLevel::High
        } else if len < 14 || diversity_score == 3 {
            RiskLevel::Medium
        } else {
            RiskLevel::Low
        }
    }
}

pub type PasswordSecret = Secret<PasswordPayload>;
