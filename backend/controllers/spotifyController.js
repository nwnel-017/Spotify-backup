const spotifyService = require("../services/spotifyService");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const supabase = require("../utils/supabase/supabaseClient"); // remove later -> move all supabase functionality to spotifyService.js

exports.getSession = async (req, res) => {
  // To Do : implement
  console.log("Attempting to retrieve session!");

  try {
    const userId = spotifyService.validateToken(req);
    console.log("user retrieved from getSession: " + userId);
    return res.status(200).json({ user: userId }); // send the user back
  } catch (error) {
    return res.status(401).json({ message: "Not authenticated!" });
  }
};

exports.signup = async (req, res) => {
  console.log("reached backend signup!");

  const { email, password } = req.body;

  try {
    const { sanitizedEmail, sanitizedPassword } = spotifyService.authValidation(
      email,
      password
    );
    {
    }
    console.log(sanitizedEmail + " " + sanitizedPassword); // undefined undefined

    if (!sanitizedEmail || !sanitizedPassword) {
      return res.status(400).json({ message: "Error signing up!" });
    }

    await spotifyService.signupUser(
      req,
      res,
      sanitizedEmail,
      sanitizedPassword
    );
    // await spotifyService.setAuthCookies(res, result.session);
    return res.status(200).json({ message: "success!" });
  } catch (error) {
    console.log("Error in signup process: " + error); // getSupabase is not a function
    return res.status(500).json({ message: "Error signing up!" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // validate input
    const { sanitizedEmail, sanitizedPassword } = spotifyService.authValidation(
      email,
      password
    );

    if (!sanitizedEmail || !sanitizedPassword) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    const session = await spotifyService.loginUser(
      sanitizedEmail,
      sanitizedPassword
    );

    // retrieve user from supabase
    spotifyService.setAuthCookies(res, session);
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

  // To Do: implement manual token refresh
};

//
exports.connectSpotify = async (req, res) => {
  console.log("reached connectSpotify controller");
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
// To Do: need to fix foreign key relation from spotify_users to users -> getting error when trying to add foreign key
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

    return res.redirect(`${process.env.CLIENT_URL}/home/${true}`);
  } catch (err) {
    console.error(err);
    return res.status(500).send("OAuth callback failed");
  }
};

exports.verifyEmailCallback = async (req, res) => {
  console.log("Hit verification email callback!");
  return res.status(200).json({ message: "Success!" });
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
