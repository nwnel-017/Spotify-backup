const { access } = require("fs");
const spotifyService = require("../services/spotifyService");
const jwt = require("jsonwebtoken");

exports.search = async (req, res) => {
  try {
    const results = await spotifyService.searchTracks(req.query.q);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  console.log("Refresh token not implemented in spotifyController");
};

exports.linkSpotify = (req, res) => {
  const scope = "playlist-read-private playlist-read-collaborative";

  const state = jwt.sign(
    { userId: req.supabaseUser.userId }, // store the user ID
    process.env.SUPABASE_JWT_SECRET, // your backend secret
    { expiresIn: "10m" } // short-lived, 10 minutes
  );

  const queryParams = new URLSearchParams({
    response_type: "code",
    scope: scope,
    redirect_uri: process.env.REDIRECT_URI,
    client_id: process.env.SPOTIFY_CLIENT_ID,
    show_dialog: "true",
    state: state,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
};

// store spotify tokens in supabase
// to do: figure out how to get userId
exports.handleCallback = async (req, res) => {
  console.log("Handling Spotify callback");
  const code = req.query.code;
  const state = req.query.state;

  if (!code || !state) {
    throw new Error("Missing authorization code or state from Spotify");
  }

  let decoded;
  try {
    decoded = jwt.verify(state, process.env.SUPABASE_JWT_SECRET);
  } catch (err) {
    console.error("Invalid or expired state JWT:", err);
    return res.status(400).json({ error: "Invalid state parameter" });
  }

  const userId = decoded.userId;

  try {
    const response = await spotifyService.exchangeCodeForToken(
      code,
      process.env.REDIRECT_URI
    );
    console.log("Received tokens from Spotify:", response.data);
    const { access_token, refresh_token, expires_in } = response.data;

    console.log(
      "Access Token received in backend callback function:",
      access_token
    );

    const result = await spotifyService
      .storeTokens(userId, access_token, refresh_token, expires_in)
      .catch((err) => {
        console.error("Error storing tokens:", err);
      });
    console.log("Tokens stored successfully:", result);

    // Redirect to frontend with the access token
    res.redirect(`${process.env.CLIENT_URL}/home`);
  } catch (error) {
    console.error(
      "Error getting tokens",
      error.response?.data || error.message
    );
    res.status(400).json({ error: "Failed to get tokens" }); //hitting this error
  }
};

exports.getPlaylistTracks = async (req, res) => {
  const playlistId = req.params.playlistId;
  const accessToken = req.accessToken;
  try {
    const data = await spotifyService.getPlaylistTracks(
      playlistId,
      accessToken
    );
    res.json(data);
  } catch (error) {
    console.error("Error fetching playlist tracks", error.response.data);
    res.status(500).json({ error: "Failed to fetch playlist tracks" });
  }
};

exports.getPlaylists = async (req, res) => {
  const accessToken = req.headers.authorization?.split(" ")[1]; // Expect "Bearer {access_token}"

  if (!accessToken) {
    return res.status(401).json({ error: "Missing access token" });
  }

  try {
    const data = await spotifyService.getPlaylists(accessToken);
    res.json(data);
  } catch (error) {
    console.error("Error fetching playlists", error.response.data);
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
};

exports.getProfile = async (req, res) => {
  const accessToken = req.spotifyAccessToken;
  console.log("Access Token in controller:", accessToken);
  if (!accessToken) {
    return res.status(401).json({ error: "Missing access token" });
  }

  try {
    const data = await spotifyService.getProfileInfo(accessToken);
    res.json(data);
  } catch (error) {
    console.error("Error fetching profile info", error.response.data);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

exports.getRefreshToken = async (req, res) => {
  const refreshToken = req.body.refresh_token; // Get refresh token from request body
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  try {
    const response = await spotifyService.refreshAccessToken(
      refreshToken,
      clientId,
      clientSecret
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error refreshing token", error.response.data);
    res.status(500).json({ error: "Failed to refresh token" });
  }
};
