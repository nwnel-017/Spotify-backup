const express = require("express");
const axios = require("axios");
const querystring = require("querystring");
const router = express.Router();

// Replace these with your actual Spotify app info
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
// const redirect_uri = "http://192.168.0.4:5000/api/auth/callback/spotify"; // Change this if you deploy!
const redirect_uri = "https://f90ed0d1de56.ngrok-free.app/api/auth/callback"; // testing using ngrok - run ngrok http 5000 from command line to get new URL

//Test route to check if the backend is working
router.get("/", (req, res) => {
  //heres a test route to see if backend is running
  res.send("Backend is up and running");
});

// 1. Redirect user to Spotify login
router.get("/login", (req, res) => {
  console.log("Reached backend route. Redirecting to Spotify login...");
  const scope = "playlist-read-private playlist-read-collaborative";
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
  console.log("Reached callback route: Code received from Spotify:", code);
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
        return response;
      });

    const { access_token, refresh_token } = response.data; //TODO: save refresh token and implement refresh token logic

    //Store tokens in session, DB, memory, etc. (for now just send back)
    res.redirect(`http://localhost:3000/home?access_token=${access_token}`);

    console.log("Access token:", access_token);

    // res.redirect(`http://192.168.0.4:3000/home?access_token=${access_token}`);
  } catch (error) {
    console.error("Error getting tokens", error.response.data);
    res.status(400).json({ error: "Failed to get tokens" });
  }
});

module.exports = router;
