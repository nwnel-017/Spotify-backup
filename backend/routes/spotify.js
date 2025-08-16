const express = require("express");
const router = express.Router();
const axios = require("axios");
const {
  getPlaylistTracks,
  getPlaylists,
  getProfile,
  getRefreshToken,
} = require("../controllers/spotifyController");
const authMiddleware = require("../middleware/authMiddleware");

//GET playlists
router.get("/playlists", authMiddleware, getPlaylists);

// GET playlist tracks (requires access token!)
router.get("/playlist/:playlistId", authMiddleware, getPlaylistTracks);

//GET profile info
router.get("/profile", authMiddleware, getProfile);

// POST to refresh access token
router.post("/refresh_token", authMiddleware, getRefreshToken);

module.exports = router;
