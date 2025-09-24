const spotifyService = require("../services/spotifyService");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const supabase = require("../utils/supabase/supabaseClient"); // remove later -> move all supabase functionality to spotifyService.js

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

exports.connectSpotify = async (req, res) => {
  console.log("reached backend connectSpotify");
  const { mode = "login" } = req.query; // "login" or "link"
  const scope = "playlist-read-private playlist-read-collaborative";
  let statePayload;

  if (mode === "link") {
    // Retrieve session from headers and put in state
    const supabaseUser = req.supabaseUser;
    if (!supabaseUser) {
      return res.status(401).json({ error: "Must be logged in to link" });
    }

    //generate a nonce
    const nonce = crypto.randomBytes(16).toString("hex");

    const { error } = await supabase.from("spotify_link_nonces").upsert({
      nonce,
      user_id: supabaseUser.id,
      expires_at: new Date(Date.now() + 1000 * 60 * 5),
    });

    if (error) {
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
// to do: figure out how to get userId
exports.handleCallback = async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    throw new Error(
      "Missing authorization code or state from Spotify in callback"
    );
  }

  console.log("state received in callback: " + state);

  let parsedState;
  try {
    parsedState = JSON.parse(state);
  } catch (error) {
    return res.status(400).send("Invalid state");
  }

  // exchange code for token // move to spotifyService
  const tokenRes = await fetch(`${process.env.SPOTIFY_TOKEN_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID +
            ":" +
            process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.REDIRECT_URI,
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    return res.status(400).send("Failed to get spotify access tokens");
  }

  // fetch spotify user to check if they exist in database
  const profileRes = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const spotifyProfile = await profileRes.json();
  const spotifyId = spotifyProfile.id;

  // user is logging in to existing account through spotify
  // To do -> add a spotifyId column to table to track the ID of the account
  if (parsedState.flow === "login") {
    const { data: existing } = await supabase
      .from("spotify_users")
      .select("user_id")
      .eq("spotify_id", spotifyId)
      .single();

    let userId;

    console.log(existing); // coming back as null

    if (existing) {
      userId = existing.user_id;
    } else {
      return res.status(500).send("User has not created an account!");
    }

    // Upsert tokens
    await supabase.from("spotify_accounts").upsert({
      user_id: userId,
      spotify_id: spotifyId,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
    });

    // Log user in (generate session)
    // Note: you can use supabase.auth.admin.generateLink if you want redirect-based login
    return res.redirect(`${process.env.CLIENT_URL}/home`);
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
  // console.log("Access token in getPlaylists:", accessToken); // correct

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

exports.getRefreshToken = async (req, res) => {
  const refreshToken = req.body.refresh_token; // Get refresh token from request body
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!refreshToken) {
    return res
      .status(400)
      .json({ error: "Missing refresh token in request body" });
  }

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
