const emailRateLimit = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function canSendVerification(email) {
  const now = Date.now();
  const lastSent = emailRateLimit.get(email);

  if (lastSent && now - lastSent < RATE_LIMIT_WINDOW_MS) {
    return false;
  }

  emailRateLimit.set(email, now);
  return true;
}

module.exports = { canSendVerification };
