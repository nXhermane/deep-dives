use keep_summary_lab_10_19::vault::Vault;

fn main() {
    let vault = Vault::new();
    println!("Vault contains {} elements!", vault.len());
}
