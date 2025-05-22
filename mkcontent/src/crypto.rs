use aes::cipher::{BlockEncryptMut, KeyIvInit};
use aes::Aes256;
use cbc::cipher::block_padding::Pkcs7;
use password_hash::rand_core::RngCore;
use pbkdf2::password_hash::{PasswordHasher, SaltString};
use pbkdf2::password_hash::rand_core::OsRng;
use pbkdf2::{Params, Pbkdf2};
type Aes256CbcEnc = cbc::Encryptor<Aes256>;

pub fn encrypt_data(plaintext: &str, password: &str) -> Vec<u8> {
    // Generate a random salt
    let salt = SaltString::generate(&mut OsRng);
    
    // Derive a key using PBKDF2
    let key = Pbkdf2.hash_password_customized(
        password.as_bytes(),
        None,
        None,
        Params {
            rounds: 100_000,
            output_length: 32, // 256-bit key
        },
        salt.as_salt(),
    ).unwrap().hash.unwrap();

    // Generate a random IV
    let mut iv = [0u8; 16];
    OsRng.fill_bytes(&mut iv);
    
    // create buffer for encrypted 
    let mut buffer = plaintext.as_bytes().to_vec();
    let pad_len = 16 - (buffer.len() % 16);
    buffer.resize(buffer.len() + pad_len, 0);

    // Create cipher instance
    let encryptor = Aes256CbcEnc::new_from_slices(key.as_bytes(), &iv).unwrap();

    let ciphertext = encryptor.encrypt_padded_mut::<Pkcs7>(&mut buffer, plaintext.len()).unwrap();
    // Encrypt the data
    
    // Combine salt, IV, and ciphertext into a single string (hex encoded)
    let mut result = Vec::new();
    result.extend_from_slice(salt.as_str().as_bytes());
    result.extend_from_slice(&iv);
    result.extend_from_slice(ciphertext);
    
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_encryption() {
        let data = "Secret message";
        let password = "strong password";
        
        let encrypted = encrypt_data(data, password);
        println!("Encrypted data: {:?}", encrypted);
        
        // In a real scenario, you would decrypt this in JavaScript
        // using the same password and parameters
    }
}