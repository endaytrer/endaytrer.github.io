use aes::cipher::{BlockEncryptMut, KeyIvInit};
use aes::Aes256;
use cbc::cipher::block_padding::Pkcs7;
use password_hash::rand_core::RngCore;
use pbkdf2::password_hash::rand_core::OsRng;
use pbkdf2::pbkdf2_hmac;
use sha2::Sha256;
type Aes256CbcEnc = cbc::Encryptor<Aes256>;
const ROUNDS: u32 = 100000;

pub fn encrypt_data(plaintext: &str, password: &str) -> Vec<u8> {
    // Generate a random salt
    let mut salt = [0u8; 16];
    OsRng.fill_bytes(&mut salt);

    // 2. Derive key (32 bytes) + IV (16 bytes)
    let mut key_iv = [0u8; 48];
    pbkdf2_hmac::<Sha256>(password.as_bytes(), &salt, ROUNDS, &mut key_iv);

    let key = &key_iv[..32];
    let iv = &key_iv[32..];
    
    // create buffer for encrypted 
    let mut buffer = plaintext.as_bytes().to_vec();
    let pad_len = 16 - (buffer.len() % 16);
    buffer.resize(buffer.len() + pad_len, 0);

    // Create cipher instance
    let encryptor = Aes256CbcEnc::new_from_slices(key, iv).unwrap();

    let ciphertext = encryptor.encrypt_padded_mut::<Pkcs7>(&mut buffer, plaintext.len()).unwrap();
    // Encrypt the data
    
    // Combine salt, IV, and ciphertext into a single string (hex encoded)
    let mut result = Vec::new();

    result.extend_from_slice(&salt);
    result.extend_from_slice(iv);
    result.extend_from_slice(ciphertext);
    
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    use base64::prelude::*;
    
    #[test]
    fn test_encryption() {
        let data = "Secret message";
        let password = "strong password";
        
        let encrypted = encrypt_data(data, password);
        let b64_encoded = BASE64_STANDARD.encode(encrypted);
        println!("Encrypted data: {}", b64_encoded);
        
        // In a real scenario, you would decrypt this in JavaScript
        // using the same password and parameters
    }
}