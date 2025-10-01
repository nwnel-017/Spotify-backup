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

  // console.log("Session user:", user); // getting valid session info

  return res.status(200).json({ user });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt for", email);

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
    console.log("setting cookies");
    spotifyService.setAuthCookies(res, data.session);
    console.log("cookies successfully set");
    return res.status(200).json({ message: "Login successful" });

    // return res.redirect(`${process.env.CLIENT_URL}/home`);
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

// exports.refreshSpotifyToken = async (req, res) => {
//   console.log("Reached refreshSpotifyToken in controller");
// };

exports.connectSpotify = async (req, res) => {
  console.log("reached backend connectSpotify");
  const isLinkFlow = !!req.supabaseUser;
  const scope = "playlist-read-private playlist-read-collaborative";
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
  console.log("Spotify auth URL: " + url);
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

  // 1. exchange code for token // move to spotifyService
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

  const tokenData = await tokenRes.json(); // spotify access tokens

  if (!tokenData.access_token) {
    return res.status(400).send("Failed to get spotify access tokens");
  }

  // 2. fetch spotify user to get spotifyId
  let spotifyProfile;
  try {
    const profileRes = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    spotifyProfile = await profileRes.json();
  } catch (error) {
    console.error("Error fetching Spotify profile:", error);
    return res.status(500).send("Failed to fetch Spotify profile");
  }

  const spotifyId = spotifyProfile.id;

  // user is logging in to existing account through spotify
  // To do -> add a spotifyId column to table to track the ID of the account
  if (parsedState.flow === "login") {
    try {
      const { data: existing } = await supabase //get userId from spotifyId
        .from("spotify_users")
        .select("user_id")
        .eq("spotify_user", spotifyId)
        .single();

      let userId;

      console.log(existing); // coming back as null

      if (existing) {
        userId = existing.user_id;
      } else {
        return res.status(500).send("User has not created an account!");
      }

      // Upsert tokens
      await supabase.from("spotify_users").upsert({
        user_id: userId,
        spotify_id: spotifyId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
      });

      // To Do -> sign in with supabase and set cookies
      // this isnt a function - figure out another way
      const { data, error } = await supabase.auth.admin.createSession({
        user_id: userId,
      });

      spotifyService.setAuthCookies(res, data.session);
    } catch (error) {
      console.error("Error during login flow:", error);
      return res.status(500).send("Database error during login process");
    }
  } else if (parsedState.flow === "link") {
    console.log("entered link flow in callback");
    const nonce = parsedState.nonce;

    if (!nonce) {
      return res.status(400).send("Invalid state flow");
    }
    const linkRecord = await supabase
      .from("spotify_link_nonces")
      .select("*")
      .eq("nonce", nonce)
      .single();

    if (!linkRecord || new Date(linkRecord.data.expires_at) < new Date()) {
      return res.status(400).send("Invalid or expired link request");
    }

    await supabase.from("spotify_link_nonces").delete().eq("nonce", nonce);

    const { data, error } = await supabase.from("spotify_users").upsert(
      {
        user_id: linkRecord.data.user_id, // has a value
        spotify_user: spotifyId, // has a value
        access_token: tokenData.access_token, // has a value
        refresh_token: tokenData.refresh_token, // has a value
        expires_at: new Date(
          Date.now() + tokenData.expires_in * 1000
        ).toISOString(),
      },
      { onConflict: ["user_id"] }
    );
    if (error) {
      console.error("Error upserting spotify_users:", error);
      return res.status(500).send("Database error during linking process");
    }
  } else {
    return res.status(400).send("Invalid state flow");
  }

  console.log("Spotify account logged in successfully");
  return res.redirect(`${process.env.CLIENT_URL}/home`);
  // return res.status(200).send("Spotify account connected successfully");
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
