const validator = require("validator");

const validateInput = (email, password) => {
  if (!email || !password) {
    return { valid: false, message: "Email and password are required." };
  }
  let sanitizedEmail = validator.trim(email);
  let sanitizedPassword = validator.trim(password);

  sanitizedEmail = validator.normalizeEmail(sanitizedEmail);

  if (!validator.isEmail(sanitizedEmail)) {
    return { valid: false, email: null, password: null };
  }

  if (!validator.isLength(sanitizedPassword, { min: 8 })) {
    throw new Error("Password must be at least 8 characters long");
  }

  return {
    valid: true,
    sanitizedEmail: sanitizedEmail,
    sanitizedPassword: sanitizedPassword,
  };
};

module.exports = { validateInput };
