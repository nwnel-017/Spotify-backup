const { access } = require("fs");
const spotifyService = require("../services/spotifyService");

exports.search = async (req, res) => {
  try {
    const results = await spotifyService.searchTracks(req.query.q);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//To Do: refactor using spotifyService
exports.loginUser = (req, res) => {
  const scope = "playlist-read-private playlist-read-collaborative";
  const redirect_uri = process.env.REDIRECT_URI;
  const queryParams = new URLSearchParams({
    response_type: "code",
    scope: scope,
    redirect_uri: redirect_uri,
    client_id: process.env.SPOTIFY_CLIENT_ID,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
};

exports.handleCallback = async (req, res) => {
  console.log("Handling Spotify callback");
  const code = req.query.code || null;
  const redirect_uri = process.env.REDIRECT_URI;

  try {
    const response = await spotifyService.exchangeCodeForToken(
      code,
      redirect_uri
    );

    const { access_token } = response.data;

    // Redirect to frontend with the access token
    res.redirect(`http://localhost:3000/home?access_token=${access_token}`); // To Do: do not put access token in url
  } catch (error) {
    console.error(
      "Error getting tokens",
      error.response?.data || error.message
    );
    res.status(400).json({ error: "Failed to get tokens" });
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
  const accessToken = req.headers.authorization?.split(" ")[1]; // Expect "Bearer {access_token}"

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
