const express = require("express");
const router = express.Router();
const axios = require("axios");
const {
  getPlaylistTracks,
  getPlaylists,
  getProfile,
  getRefreshToken,
  unlinkSpotify,
} = require("../controllers/spotifyController");
const authMiddleware = require("../middleware/authMiddleware");
const spotifyAuthMiddleware = require("../middleware/spotifyAuthMiddleware");

//GET playlists
router.get("/playlists", authMiddleware, spotifyAuthMiddleware, getPlaylists);

// GET playlist tracks (requires access token!)
router.get(
  "/playlist/:playlistId",
  authMiddleware,
  spotifyAuthMiddleware,
  getPlaylistTracks
);

//GET profile info
router.get("/profile", authMiddleware, spotifyAuthMiddleware, getProfile);

router.post("/unlink", authMiddleware, spotifyAuthMiddleware, unlinkSpotify);

// POST to refresh access token
// router.post("/refresh_token", authMiddleware, getRefreshToken);

module.exports = router;
