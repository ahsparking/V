/**
 * Hardware-grade local encryption service using the Web Cryptography API (SubtleCrypto)
 * Implements AES-GCM 256-bit encryption with PBKDF2 key derivation and random 96-bit IVs.
 */

const SALT = new Uint8Array([75, 97, 114, 100, 86, 97, 117, 108, 116, 83, 101, 99, 117, 114, 101, 33]); // "KardVaultSecure!"
const ITERATIONS = 100000;

let cachedKey: CryptoKey | null = null;

/**
 * Derives a 256-bit AES-GCM key using PBKDF2 with SHA-256 from a seed or passphrase.
 */
export async function getMasterKey(passphrase: string = 'CardVault_LocalMasterKey_v1'): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  cachedKey = derivedKey;
  return derivedKey;
}

/**
 * Encrypts an arbitrary object into AES-256-GCM ciphertext + IV.
 */
export async function encryptPayload<T>(payload: T, customKey?: CryptoKey): Promise<{
  ciphertext: string;
  iv: string;
  hash: string;
}> {
  const key = customKey || (await getMasterKey());
  const enc = new TextEncoder();
  const plaintext = JSON.stringify(payload);
  const dataBytes = enc.encode(plaintext);

  // Generate 12-byte (96-bit) cryptographically random IV for AES-GCM
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128,
    },
    key,
    dataBytes
  );

  // Calculate SHA-256 hash of original data for integrity verification
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const ciphertextBase64 = arrayBufferToBase64(encryptedBuffer);
  const ivBase64 = arrayBufferToBase64(iv.buffer);

  return {
    ciphertext: ciphertextBase64,
    iv: ivBase64,
    hash: hashHex,
  };
}

/**
 * Decrypts AES-256-GCM ciphertext + IV back into the typed payload.
 */
export async function decryptPayload<T>(
  ciphertextBase64: string,
  ivBase64: string,
  customKey?: CryptoKey
): Promise<T> {
  const key = customKey || (await getMasterKey());
  const ciphertextBuffer = base64ToArrayBuffer(ciphertextBase64);
  const ivBuffer = base64ToArrayBuffer(ivBase64);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(ivBuffer),
      tagLength: 128,
    },
    key,
    ciphertextBuffer
  );

  const dec = new TextDecoder();
  const plaintext = dec.decode(decryptedBuffer);
  return JSON.parse(plaintext) as T;
}

/**
 * Computes a SHA-256 fingerprint hex of a string.
 */
export async function computeSha256(text: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Utility conversion helpers
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
