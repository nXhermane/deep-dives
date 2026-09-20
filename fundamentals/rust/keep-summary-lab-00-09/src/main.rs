struct SecretEntry {
    label: String,
    value: String,
    note: Option<String>,
}

enum EntryError {
    EmptyLabel,
    ValueTooShort(usize),
}

impl std::fmt::Display for EntryError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            EntryError::EmptyLabel => write!(f, "The entry label is empty"),
            EntryError::ValueTooShort(len) => write!(
                f,
                "The value is too short. please provide the value that lenght is greater than eight."
            ),
        }
    }
}

fn validate_label(label: &String) -> Result<(), EntryError> {
    if label.is_empty() {
        Err(EntryError::EmptyLabel)
    } else {
        Ok(())
    }
}

fn validate_value(value: &String) -> Result<(), EntryError> {
    if value.len() < 8 {
        Err(EntryError::ValueTooShort(value.len()))
    } else {
        Ok(())
    }
}

fn new_entry(
    label: String,
    value: String,
    note: Option<String>,
) -> Result<SecretEntry, EntryError> {
    validate_label(&label)?;
    validate_value(&value)?;
    Ok(SecretEntry { label, value, note })
}

fn describe(entry: &SecretEntry) -> String {
    let note_description = match &entry.note {
        Some(note) => note.clone(),
        None => "empty".to_string(),
    };

    format!(
        "Entry {} has {} as value and its note is {}",
        &entry.label, &entry.value, note_description
    )
}

fn update_value(entry: &mut SecretEntry, new_value: String) -> Result<(), EntryError> {
    validate_value(&new_value)?;
    entry.value = new_value;
    Ok(())
}

fn main() {
    // create valid entry
    let valid_entry = new_entry(
        "Google Cloud Account".to_string(),
        "password".to_string(),
        Some("This is my google cloud account password.".to_string()),
    );
    if let Ok(entry) = &valid_entry {
        println!("This is valid_entry description => {}", describe(&entry));
    }
    // create invalid entry
    let invalid_entry = new_entry("".to_string(), "To".to_string(), None);
    if let Err(error) = &invalid_entry {
        println!("This is invalid entry error => {}", error);
    }
    // update value
    // create mutable entry
    let mut mutable_entry = new_entry(
        "Facebook Account".to_string(),
        "secure_password".to_string(),
        None,
    );
    if let Ok(entry) = &mut mutable_entry {
        let failed_update = update_value(entry, "ta".to_string());
        if let Err(error) = failed_update {
            println!("This is update error => {}", error);
        }
        let _ = update_value(entry, String::from("this_secure_password"));

        println!("This is udated entry => {}", describe(entry));
    }
}
