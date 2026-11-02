#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub struct SimpleDate(u16, u8, u8); // jour, mois, année (ex. 1/1/2024)

impl SimpleDate {
    pub fn from_ymd(year: u16, month: u8, day: u8) -> Self {
        Self(year, month, day)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_constructor() {
        let date = SimpleDate::from_ymd(2026, 2, 1);
        assert_eq!(date, SimpleDate(2026, 2, 1));
    }

    #[test]
    fn test_chronological_ordering() {
        let earlier = SimpleDate::from_ymd(2025, 12, 31);
        let same_year_later = SimpleDate::from_ymd(2026, 1, 15);
        let later_month = SimpleDate::from_ymd(2026, 2, 1);

        assert!(earlier < same_year_later);
        assert!(same_year_later < later_month);
        assert_eq!(later_month, SimpleDate::from_ymd(2026, 2, 1));
    }
}
