use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2
};

pub async fn hash_password(password: &str) -> String {
    let salt = SaltString::generate(&mut OsRng); //Salt is what argon uses so that if 2 diff users have the same password the hash is different
    let argon2 = Argon2::default();

    argon2.hash_password(password.as_bytes(), &salt)
        .expect("Error hashing password")
        .to_string()
}