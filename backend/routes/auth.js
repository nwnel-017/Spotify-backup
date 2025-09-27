const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const {
  getSession,
  login,
  connectSpotify,
  handleCallback,
  refreshToken,
} = require("../controllers/spotifyController");

// get session
router.get("/me", getSession);

// Standard Login
router.post("/login", login);

// Login through Spotify OAuth
router.get("/loginWithSpotify", connectSpotify);

// Link spotify accout with OAuth
router.get("/linkAccount", authMiddleware, connectSpotify);

// 2. Handle callback and exchange code for access token
router.get("/callback", handleCallback);

router.get("/refreshToken", refreshToken);

router.get("/logout", (req, res) => {
  console.log("logout not implemented yet");
});

module.exports = router;
