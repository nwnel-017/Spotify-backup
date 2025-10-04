const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const {
  getSession,
  login,
  signUp,
  connectSpotify,
  refreshToken,
  handleCallback,
} = require("../controllers/spotifyController");

// First Time Sign up
router.post("/signup", signUp);

// Standard Login
router.post("/login", login);

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
