/**
 * Decodes a base64-encoded ciphertext and decrypts it using the provided password.
 * The base64 data format: [16 bytes salt][16 bytes iv][ciphertext]
 * Key is derived using PBKDF2 (SHA-256), AES-256-CBC, PKCS7 padding.
 *
 * @param {string} base64Ciphertext - The base64-encoded ciphertext.
 * @param {string} password - The password for decryption.
 * @returns {Promise<string>} The decrypted plaintext.
 */
async function decryptBase64Ciphertext(base64Ciphertext, password) {
    function base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
        return bytes.buffer;
    }
    
    const data = new Uint8Array(base64ToArrayBuffer(base64Ciphertext));
    if (data.length < 32) throw new Error('Invalid ciphertext: too short');

    const salt = data.slice(0, 16);
    const iv = data.slice(16, 32);
    const ciphertext = data.slice(32);

    // Derive key using PBKDF2 (SHA-256)
    const enc = new TextEncoder();
    if (window.crypto.subtle === undefined) {
        throw new Error("Unable to decrypt in a HTTP environment")
    }
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );
    const key = await window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-CBC', length: 256 },
        false,
        ['decrypt']
    );
    console.log(key);

    // Decrypt using AES-256-CBC
    let decrypted;
    try {

        decrypted= await window.crypto.subtle.decrypt(
            { name: 'AES-CBC', iv: iv },
            key,
            ciphertext
        );
    } catch {
        throw new Error("Decryption failed")
    }

    // Remove PKCS7 padding
    const decryptedBytes = new Uint8Array(decrypted);
    // const padLen = decryptedBytes[decryptedBytes.length - 1];
    // const unpadded = decryptedBytes.slice(0, decryptedBytes.length - padLen);

    return new TextDecoder().decode(decryptedBytes);
}
const passwordForm = document.querySelector("#password-form");
passwordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const password = document.querySelector("#password").value;
    const base64Ciphertext = document.querySelector("#ciphertext").innerText;

    try {
        const plaintext = await decryptBase64Ciphertext(base64Ciphertext, password);
        document.querySelector("#plaintext").innerHTML = plaintext;
        passwordForm.remove();
    } catch (error) {
        document.querySelector("#password-prompt").innerHTML = `Error: ${error.message}`;
    }
})