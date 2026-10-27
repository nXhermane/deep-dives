#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub struct SimpleDate(u16, u8, u8); // jour, mois, année (ex. 1/1/2024)

impl SimpleDate {
    pub fn from_ymd(year: u16, month: u8, day: u8) -> Self {
        Self(year, month, day)
    }
}
