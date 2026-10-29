use std::{cmp::Ordering, collections::HashMap, fmt::Display, hash::Hash};

use crate::{
    audit::{AuditEntry, Auditable, AuditablePayload},
    secret::RiskLevel,
};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SecretBox<T> {
    payload: T,
}

impl<T> SecretBox<T> {
    pub fn new(payload: T) -> Self {
        Self { payload }
    }

    pub fn get(&self) -> &T {
        &self.payload
    }

    pub fn into_inner(self) -> T {
        self.payload
    }

    pub fn map<U, F: FnOnce(T) -> U>(self, f: F) -> SecretBox<U> {
        SecretBox::new(f(self.payload))
    }
}

impl<T: Clone> SecretBox<T> {
    pub fn duplicate(&self) -> Self {
        Self::new(self.payload.clone())
    }
}

impl<T: AuditablePayload> SecretBox<T> {
    pub fn mask(&self) -> String {
        self.payload.mask()
    }

    pub fn risk_level(&self) -> RiskLevel {
        self.payload.risk_level()
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SecretPair<K, V> {
    key: K,
    value: V,
}

impl<K, V> SecretPair<K, V> {
    pub fn new(key: K, value: V) -> Self {
        Self { key, value }
    }

    pub fn key(&self) -> &K {
        &self.key
    }

    pub fn value(&self) -> &V {
        &self.value
    }

    pub fn into_parts(self) -> (K, V) {
        (self.key, self.value)
    }

    pub fn map_value<U, F: FnOnce(V) -> U>(self, f: F) -> SecretPair<K, U> {
        SecretPair {
            key: self.key,
            value: f(self.value),
        }
    }
}

impl<K: Ord, V> SecretPair<K, V> {
    pub fn cmp_by_key(&self, other: &Self) -> Ordering {
        self.key.cmp(&other.key)
    }
}

pub fn find_max_pair<K, V>(pairs: &[SecretPair<K, V>]) -> Option<&SecretPair<K, V>>
where
    K: Ord,
{
    pairs.iter().max_by(|a, b| a.cmp_by_key(b))
}

pub fn audit_item<T: Auditable>(item: &T) -> AuditEntry {
    item.audit_entry()
}

pub fn audit_collection<I, T: Auditable>(items: I) -> Vec<AuditEntry>
where
    I: IntoIterator<Item = T>,
{
    items.into_iter().map(|item| item.audit_entry()).collect()
}

pub fn find_by_key<'a, K: PartialEq, V>(
    pairs: &'a [SecretPair<K, V>],
    target_key: &K,
) -> Option<&'a V> {
    pairs
        .iter()
        .find(|pair| pair.key() == target_key)
        .map(|pair| pair.value())
}

pub fn sort_pairs_by_key<K: Ord, V>(pairs: &mut [SecretPair<K, V>]) {
    pairs.sort_by(|a, b| a.key().cmp(b.key()));
}

pub fn pairs_to_map<K: Eq + Hash, V>(pairs: Vec<SecretPair<K, V>>) -> HashMap<K, V> {
    pairs.into_iter().map(|pair| pair.into_parts()).collect()
}

pub fn compare_and_report<K, V>(first: &SecretPair<K, V>, second: &SecretPair<K, V>) -> bool
where
    K: Ord + Display + Clone,
    V: Auditable,
{
    println!(
        "Comparaison des secrets pour les clés: {} vs {}",
        first.key(),
        second.key()
    );
    first.key() == second.key() && first.value().risk_level() == second.value().risk_level()
}
