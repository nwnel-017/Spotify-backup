const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY, "hex"); // 32 bytes
const IV_LENGTH = 16;

/**
 * Generates a SHA-256 hash for the given input.
 * @param {string} text - plaintext to encrypt
 * @returns {string} - encrypted string formatted as iv:tag:ciphertext
 */
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypt text previously encrypted with encrypt()
 * @param {string} encryptedText - string in format iv:tag:ciphertext
 * @returns {string} - decrypted plaintext
 */
function decrypt(encryptedText) {
  const [ivHex, tagHex, encrypted] = encryptedText.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(tagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

function generateHash(data) {
  if (data === undefined || data === null) {
    throw new Error("Input data must not be null or undefined");
  }

  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

function generateNonce() {
  return crypto.randomBytes(16).toString("hex");
}

module.exports = { encrypt, decrypt, generateHash, generateNonce };
