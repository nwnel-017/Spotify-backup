const spotifyService = require("../services/spotifyService");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const supabase = require("../utils/supabase/supabaseClient"); // remove later -> move all supabase functionality to spotifyService.js
const { access } = require("fs");

exports.getSession = async (req, res) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(req.cookies["sb-access-token"]);

  if (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return res.status(200).json({ user });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return res.status(401).json({ error: error.message });
    }
    spotifyService.setAuthCookies(res, data.session);
    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.search = async (req, res) => {
  try {
    const results = await spotifyService.searchTracks(req.query.q);
    ``;
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  console.log("reached refresh token controller");
  try {
    const refreshToken = res.cookies["sb-refresh-token"];
    if (!refreshToken) {
      return res.status(400).json({ error: "No refresh token provided" });
    }

    const newSession = await spotifyService.refreshAccessToken(refreshToken);
    spotifyService.setAuthCookies(res, newSession);
    return res.status(200).json({ message: "Token refreshed" });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return res.status(500).json({ error: "Failed to refresh token" });
  }
};

exports.connectSpotify = async (req, res) => {
  const isLinkFlow = !!req.supabaseUser;
  const scope =
    "playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public";
  let statePayload;

  if (isLinkFlow) {
    // Retrieve session from headers and put in state
    const supabaseUser = req.supabaseUser;
    if (!supabaseUser) {
      return res.status(401).json({ error: "Must be logged in to link" });
    }

    //generate a nonce
    const nonce = crypto.randomBytes(16).toString("hex");

    const { error } = await supabase.from("spotify_link_nonces").upsert({
      nonce,
      user_id: supabaseUser,
      expires_at: new Date(Date.now() + 1000 * 60 * 5),
    });

    if (error) {
      console.log("error inserting nonce: ", error);
      return res.status(500).json({ error: "database error" });
    }

    statePayload = { flow: "link", nonce: nonce };
  } else {
    statePayload = { flow: "login" };
  }

  const queryParams = new URLSearchParams({
    response_type: "code",
    scope: scope,
    redirect_uri: process.env.REDIRECT_URI,
    client_id: process.env.SPOTIFY_CLIENT_ID,
    show_dialog: "true",
    state: JSON.stringify(statePayload), // Either contains supabase session or null depending on whether we are logging in / linking account
  });

  const url = `https://accounts.spotify.com/authorize?${queryParams}`;
  res.json({ url }); //send url back to frontend
};

// store spotify tokens in supabase
// to do: way to much code here -> goint to move business logic to spotifyService.js
exports.handleCallback = async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    throw new Error(
      "Missing authorization code or state from Spotify in callback"
    );
  }

  let parsedState;
  try {
    parsedState = JSON.parse(state);
  } catch (error) {
    return res.status(400).send("Invalid state");
  }

  try {
    const result = await spotifyService.handleOAuth(code, parsedState);

    if (parsedState.flow === "login") {
      spotifyService.setAuthCookies(res, result.session);
    }

    return res.redirect(`${process.env.CLIENT_URL}/home`);
  } catch (err) {
    console.error(err);
    return res.status(500).send("OAuth callback failed");
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
  const spotifyToken = req.spotifyAccessToken; // Expect "Bearer {access_token}"
  const supabaseUser = req.supabaseUser;

  if (!spotifyToken || !supabaseUser) {
    return res.status(401).json({ error: "Missing access token" });
  }

  const { offset = 0, limit = 50 } = req.query;

  try {
    const response = await spotifyService.getPlaylists(
      spotifyToken,
      parseInt(offset, 10),
      parseInt(limit, 10)
    );
    res.json(response);
  } catch (error) {
    console.error("Error fetching playlists", error.response.data);
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
};

exports.getProfile = async (req, res) => {
  const accessToken = req.spotifyAccessToken; //attached by spotify middleware
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
