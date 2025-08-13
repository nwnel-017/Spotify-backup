const axios = require("axios");

module.exports = async function (req, res, next) {
  const authHeader = req.headers["authorization"];

  // Check for Bearer token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No Spotify access token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token with Spotify's /me endpoint
    const response = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Attach Spotify user data to the request
    req.spotifyUser = response.data;
    req.spotifyAccessToken = token;

    next();
  } catch (error) {
    console.error(
      "Spotify token verification failed:",
      error.response?.data || error.message
    );
    return res.status(401).json({ error: "Invalid or expired Spotify token" });
  }
};
