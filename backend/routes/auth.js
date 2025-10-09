const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const {
  getSession,
  // getUser,
  login,
  signup,
  connectSpotify,
  refreshToken,
  handleCallback,
  verifyEmailCallback,
} = require("../controllers/spotifyController");

// First Time Sign up
router.post("/signup", signup);

// Standard Login
router.post("/login", login);

router.post("/emailVerification", verifyEmailCallback);

// get session
router.get("/me", getSession);

// refresh access token
router.get("/refreshToken", refreshToken);

// Login through Spotify OAuth
router.get("/loginWithSpotify", connectSpotify);

// Link spotify accout with OAuth
router.get("/linkAccount", authMiddleware, connectSpotify);

// 2. Handle callback and exchange code for access token
router.get("/callback", handleCallback);

router.get("/logout", (req, res) => {
  console.log("logout not implemented yet");
});

module.exports = router;
