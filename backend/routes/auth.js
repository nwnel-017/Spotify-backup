const express = require("express");
const axios = require("axios");
const querystring = require("querystring");
const router = express.Router();

// Replace these with your actual Spotify app info
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = "http://192.168.1.5:5000/api/auth/callback"; // Change this if you deploy!

// 1. Redirect user to Spotify login
router.get("/login", (req, res) => {
  console.log("Reached backend route. Redirecting to Spotify login...");
  const scope = "playlist-read-private playlist-read-collaborative";
  console.log("client_id from backend", client_id);
  console.log("client_secret from backend", client_secret);
  console.log("redirect_uri from backend", redirect_uri);
  const queryParams = querystring.stringify({
    response_type: "code",
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

// 2. Handle callback and exchange code for access token
router.get("/callback", async (req, res) => {
  const code = req.query.code || null;

  try {
    const response = await axios
      .post(
        "https://accounts.spotify.com/api/token",
        querystring.stringify({
          code: code,
          redirect_uri: redirect_uri,
          grant_type: "authorization_code",
        }),
        {
          headers: {
            Authorization:
              "Basic " +
              Buffer.from(client_id + ":" + client_secret).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then((response) => {
        console.log("Response from Spotify:", response.data);
        return response;
      });

    const { access_token, refresh_token } = response.data;

    // Store tokens in session, DB, memory, etc. (for now just send back)
    res.json({
      access_token,
      refresh_token,
    });
  } catch (error) {
    console.error("Error getting tokens", error.response.data);
    res.status(400).json({ error: "Failed to get tokens" });
  }
});

module.exports = router;
