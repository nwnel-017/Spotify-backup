const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const {
  linkSpotify,
  handleCallback,
  refreshToken,
} = require("../controllers/spotifyController");

// 1. Redirect user to Spotify login -> handled by spotifyController.js
router.get("/linkAccount", authMiddleware, linkSpotify);

// 2. Handle callback and exchange code for access token
router.get("/callback", handleCallback);

router.get("/refreshToken", refreshToken);

router.get("/logout", (req, res) => {
  console.log("logout not implemented yet");
});

module.exports = router;
