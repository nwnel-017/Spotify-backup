const express = require("express");
const router = express.Router();
const axios = require("axios");

// Example: GET /api/spotify/search?q=drake
router.get("/search", async (req, res) => {
  const query = req.query.q;
  const accessToken = req.app.get("spotifyAccessToken"); // Get token from app

  try {
    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q: query,
        type: "artist",
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error searching Spotify:", error.response.data);
    res.status(500).json({ error: "Failed to fetch from Spotify" });
  }
});

//GET playlists from a user
//To Do: finish implementation
router.get("/playlists/:userId", async (req, res) => {
  const userId = req.params.userId;
  const accessToken = req.headers.authorization?.split(" ")[1]; // Expect "Bearer {access_token}"

  if (!accessToken) {
    return res.status(401).json({ error: "Missing access token" });
  }

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching playlists", error.response.data);
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
});

// GET playlist tracks (requires access token!)
router.get("/playlist/:playlistId", async (req, res) => {
  const playlistId = req.params.playlistId;
  const accessToken = req.headers.authorization?.split(" ")[1]; // Expect "Bearer {access_token}"

  if (!accessToken) {
    return res.status(401).json({ error: "Missing access token" });
  }

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching playlist tracks", error.response.data);
    res.status(500).json({ error: "Failed to fetch playlist" });
  }
});

//GET profile info
router.get("/profile", async (req, res) => {
  const accessToken = req.headers.authorization?.split(" ")[1]; // Expect "Bearer {access_token}"

  if (!accessToken) {
    return res.status(401).json({ error: "Missing access token" });
  }

  try {
    const response = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("Profile data:", response.data); // Log the profile data
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching profile info", error.response.data);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

module.exports = router;
