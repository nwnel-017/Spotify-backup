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
router.get("/playlists", async (req, res) => {
  console.log("Hello from playlists route"); //getting hit
  const accessToken = req.headers.authorization?.split(" ")[1]; // Expect "Bearer {access_token}"
  const limit = req.query.limit || 5;
  const offset = req.query.offset || 0;

  if (!accessToken) {
    return res.status(401).json({ error: "Missing access token" });
  }

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/me/playlists`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          limit,
          offset,
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
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching profile info", error.response.data);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.post("/refresh_token", async (req, res) => {
  const refreshToken = req.body.refresh_token; // Get refresh token from request body
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error refreshing token", error.response.data);
    res.status(500).json({ error: "Failed to refresh token" });
  }
});

module.exports = router;
