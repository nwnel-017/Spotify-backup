const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const {
  getSession,
  // getUser,
  login,
  logout,
  signup,
  linkSpotify,
  loginWithSpotify,
  refreshToken,
  handleCallback,
} = require("../controllers/spotifyController");

// First Time Sign up
router.post("/signup", signup);

// Standard Login
router.post("/login", login);

// logout
router.get("/logout", logout);

// get session
router.get("/me", getSession);

// refresh access token
router.get("/refreshToken", refreshToken);

// Login through Spotify OAuth
router.get("/loginWithSpotify", loginWithSpotify);

// Link spotify accout with OAuth
router.get("/linkAccount", authMiddleware, linkSpotify);

// 2. Handle callback and exchange code for access token
router.get("/callback", handleCallback);

module.exports = router;
