const express = require("express");
const axios = require("axios");
const querystring = require("querystring");
const router = express.Router();
const {
  loginUser,
  handleCallback,
} = require("../controllers/spotifyController");

// Replace these with your actual Spotify app info
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

//Test route to check if the backend is working
router.get("/", (req, res) => {
  res.send("Backend is up and running");
});

// 1. Redirect user to Spotify login -> handled by spotifyController.js
router.get("/login", loginUser);

// 2. Handle callback and exchange code for access token
router.get("/callback", handleCallback);

module.exports = router;
