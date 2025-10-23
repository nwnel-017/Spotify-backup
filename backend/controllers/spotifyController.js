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

    if (!sanitizedEmail || !sanitizedPassword) {
      return res.status(400).json({ message: "Error signing up!" });
    }

    await spotifyService.signupUser(sanitizedEmail, sanitizedPassword);
    // await spotifyService.setAuthCookies(res, result.session);
    return res.status(200).json({ message: "success!" });
  } catch (error) {
    console.log("Error in signup process: " + error); // getSupabase is not a function
    return res.status(500).json({ message: "Error signing up!" });
  }
};

exports.verifyUser = async (req, res) => {
  console.log("Hit /verifyUser route");

  const { token } = req.query;
  if (!token) {
    console.log("error - missing access token!");
    return res.status(400).json({ message: "Missing credentials!" });
  }

  try {
    const session = await spotifyService.verifyUser(token);
    spotifyService.setAuthCookies(res, session);
    return res.redirect(`${process.env.CLIENT_URL}/home?firstTimeUser=${true}`);
  } catch (error) {
    console.log("error verifying user: " + error);
    return res.status(500).json({
      message: "Failed to verify user! Verification email may be expired",
    });
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
    if (error.status === 401 && error.code === "USER_NOT_VERIFIED") {
      console.log("controller has found user to not be verified"); // hit here
      return res.status(401).json({ message: error.code });
    } else if (error.status === 400 && error.code === "USER_NOT_FOUND") {
      return res.status(400).json({ message: error.code });
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

exports.logout = async (req, res) => {
  console.log("logging out user...");

  try {
    spotifyService.clearAuthCookies(res);
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to end session" });
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
  console.log("hit refreshToken controller!"); /// hit here
  try {
    const refreshToken = req.cookies?.["sb-refresh-token"];
    if (!refreshToken) {
      console.log("refresh token was not found in cookies");
      return res.status(401).json({ message: "Error: no refresh token!" });
    }

    console.log(
      "retrieved refresh token! now call spotifyService.refreshAccessToken"
    );

    const newTokens = spotifyService.refreshAccessToken(refreshToken);
    await spotifyService.setAuthCookies(res, newTokens);
    return res
      .status(200)
      .json({ message: "Access token has been refreshed!" });
  } catch (error) {
    console.log("Error refreshing token: " + error);
    return res.status(500).json({ message: "Failed to refresh token!" });
  }
};

exports.loginWithSpotify = async (req, res) => {
  console.log("hit spotify login controller");
  try {
    const url = await spotifyService.buildOAuthUrl({ flow: "login" });
    res.json({ url });
  } catch (error) {
    throw new Error("Error creating login link: " + error);
  }
};

exports.linkSpotify = async (req, res) => {
  try {
    const supabaseUser = req.supabaseUser;

    const url = await spotifyService.buildOAuthUrl({
      flow: "link",
      userId: supabaseUser,
    });
    res.json({ url });
  } catch (error) {
    console.log("Error building url: " + error.message);
    return res.status(500).json({ message: "Failed to restore playlist!" });
  }
};

exports.restorePlaylist = async (req, res) => {
  try {
    const playlistId = req.params.id;
    const supabaseUser = req.supabaseUser;

    if (!supabaseUser || !playlistId) {
      console.log("supabase id: " + supabaseUser);
      console.log("playlist id: " + playlistId); ///////////////missing playlist id -> there is no playlist id if upload -> we need playlistName
      console.log("Missing supababase user id or playlist id!");
      return res.status(400).json({ message: "Missing parameters!" });
    }

    const url = await spotifyService.buildOAuthUrl({
      flow: "restore",
      playlistId,
      userId: supabaseUser,
    });
    res.json({ url });
  } catch (error) {
    console.log("Error building url: " + error.message);
    return res.status(500).json({ message: "Failed to restore playlist!" });
  }
};

exports.fileRestore = async (req, res) => {
  try {
    const { playlistName, supabaseUser, trackIds } = req;

    if (!supabaseUser || !playlistName || !trackIds) {
      console.log("Error in backend: Missing authentication");
      return res
        .status(401)
        .json({ message: "Error: missing required parameters" });
    }

    const url = await spotifyService.buildOAuthUrl({
      flow: "fileRestore",
      playlistName: playlistName,
      trackIds: trackIds,
      userId: supabaseUser,
    });

    res.json({ url });
  } catch (error) {
    console.log("Error from controller: " + error);
    return res
      .status(500)
      .json({ message: "Error restoring file to playlist: " + error });
  }
};

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
    const session = await spotifyService.handleOAuth(code, parsedState);

    if (parsedState.flow === "login") {
      spotifyService.setAuthCookies(res, session);
      return res.redirect(`${process.env.CLIENT_URL}/home`); // error happens here -> cookies are wiped when we redirect to client url
    }
    if (parsedState.flow === "link") {
      return res.redirect(
        `${process.env.CLIENT_URL}/home?firstTimeUser=${true}`
      );
    } else if (parsedState.flow === "restore") {
      return res.redirect(
        `${process.env.CLIENT_URL}/home?playlistRestored=${true}`
      );
    } else if (parsedState.flow === "fileRestore") {
      return res.redirect(
        `${process.env.CLIENT_URL}/home?fileRestored=${true}`
      );
    } else {
      return res.redirect(`${process.env.CLIENT_URL}/home`);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("OAuth callback failed");
    // return res.redirect(`${process.env.CLIENT_URL}/login?loginError=${true}`);
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
    console.error("Error fetching playlists", error);
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
