# keep - summary of lab 00 to 09

Le summary consiste à modéliser une entré de secret du vault keep (`SecretEntry`) et lui appliquer les notions suivantes: 
- ownership
- borrowing
- struct
- enums
- pattern matching
- `Result`
- `Option`
- `?`
Pour cela les tâches suivantes sont assignées:
- Définir un struct `SecretEntry` contenant `label: String`, `value: String` et `note: Option<String>`.
- Définir un enum d'erreur `EntryError` avec au moins de variantes (`EmptyLabel`, `ValueTooShort(usize)`).
- Écire une fonction constructice : 

```rust
/// return EmptyLabel when label is empty
/// return ValueTooShort when value.len < 8
/// return SecretEntry when all is fine
fn new_entry(label: String, value: String, note: Option<String>) -> Result<SecretEntry, EntryError>;

```
- Écire une function qui emprunte l'entrée afin d'afficher un résumé:
```rust
/// use match to show different result when note is provide or not
fn describe(entry: &SecretEntry) -> String
```
- Écire une function qui met à jour la valeur d'une entrée existante et retourne `Result`
```rust
/// resuse the same rule on new_value 
/// refactor : create a new private function to encapsulate the value property validation called here with `?`
fn update_value(entry: &mut SecretEntry, new_value: String) -> Result<(), EntryError>
```
- Dans le main enchainer avec la creation d'une entré valide, tentative de creation d'une entré invalide(afficher 
- l'erreur avec {:?} ou en implementant le trait `Display`), mise a jour réussir, mise a jour échouée.  
