const crypto = require("crypto");

/**
 * Generates a SHA-256 hash for the given input.
 * @param {any} data - The input data to hash. Must be JSON-serializable.
 * @returns {string} - The SHA-256 hash of the input.
 */
function generateHash(data) {
  if (data === undefined || data === null) {
    throw new Error("Input data must not be null or undefined");
  }

  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

module.exports = { generateHash };
