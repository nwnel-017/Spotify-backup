// /services/spotifyAuth.js
require("dotenv").config();
const axios = require("axios");
const supabase = require("../utils/supabase/supabaseClient");
// const { getSupabase } = require("../utils/supabase/supabaseClient");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("../utils/crypto");
const { validateInput } = require("../utils/authValidation/validator");
const { json } = require("express");

let accessToken = "";
const tokenUrl = process.env.SPOTIFY_TOKEN_URL;
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const TOKEN_REFRESH_INTERVAL = 3500 * 1000; // ~58 minutes

function authValidation(email, password) {
  if (!email || !password) {
    throw new Error("missing email and password!");
  }

  const { sanitizedEmail, sanitizedPassword } = validateInput(email, password);

  console.log("after validation: " + sanitizedEmail + ", " + sanitizedPassword); // correct email

  if (!sanitizedEmail || !sanitizedPassword) {
    throw new Error("Invalid input!");
  }

  return {
    sanitizedEmail: sanitizedEmail,
    sanitizedPassword: sanitizedPassword,
  };
}

async function signupUser(req, res, email, password) {
  // To Do - remove supabase auth
  // insert into new users table in supabase
  // sign a JWT with the user id
  // store JWT in cookies
  // return success message to client
  console.log("signing up user...");

  if (!email || !password) {
    throw new Error("missing email and / or password!");
  }

  // hash password
  const hashed = await bcrypt.hash(password, 12);

  console.log("hashed password: " + hashed);

  const { data, error } = await supabase
    .from("users")
    .insert([{ email, password: hashed }])
    .select("id")
    .single();

  if (!data || error) {
    if (error.message?.includes("duplicate key")) {
      const duplicateError = new Error("DUPLICATE_USERS");
      duplicateError.code = "DUPLICATE_USERS"; // custom code for the frontend
      throw duplicateError;
    }
    throw new Error("Error inserting user into database!");
  }

  const userId = data.id;

  // generate new jwt
  //store in cookies
  try {
    const newTokens = generateTokens(userId); // success

    setAuthCookies(res, newTokens);

    console.log("JWT generated: " + newTokens);
  } catch (error) {
    console.log("Error issuing new tokens: " + error);
    throw new Error(error.message);
  }

  // To Do : sign up user using supabase ssr package
  // try {
  //   const supabase = getSupabase()
  // }

  // To Do: use supabase to sign in the user, then manually store tokens in cookies
  // const { error } = await supabase.auth.signUp({
  //   email,
  //   password,
  //   options: {
  //     emailRedirectTo: `${process.env.REACT_APP_CLIENT_URL}/home`,
  //   },
  // });

  // if (error) {
  //   // still unsure if i should throw errors or only return status in controller
  //   throw new Error(error.message);
  // }
  // return data;
}

async function loginUser(email, password) {
  if (!email || !password) {
    throw new Error("missing email and / or password!");
  }

  try {
    // retrieve user by email and compare hashes
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, password")
      .eq("email", email)
      .single();

    if (!user || error) {
      throw new Error("Error logging in!: " + error.message);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect email or password!" });
    }

    const newTokens = generateTokens(user.id);

    if (!newTokens || !newTokens.access_token || !newTokens.refresh_token) {
      throw new Error("unable to generate tokens!");
    }

    return newTokens;
  } catch (error) {
    console.log("Error signing in user: " + error);
    throw new Error("Error logging in: " + error);
  }
}

function validateToken(req) {
  const token = req.cookies?.["sb-access-token"];

  if (!token) {
    throw new Error("Missing token!");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    return userId;
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    throw new Error("Not authenticated!");
  }
}

function generateTokens(id) {
  if (!id) {
    throw new Error("No ID provided!");
  }

  const access_token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const refresh_token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  if (!access_token || !refresh_token) {
    console.log("Failed to generate token!");
    throw new Error("Failed to generate token!");
  }

  return { access_token, refresh_token };
}

async function setAuthCookies(res, session) {
  try {
    res.cookie("sb-access-token", session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // expires in not defined!
    });

    res.cookie("sb-refresh-token", session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30 * 1000,
    });
  } catch (error) {
    console.error("Error setting auth cookies:", error);
    throw new Error("Failed to set authentication cookies");
  }
}

async function exchangeCodeForToken(code) {
  try {
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

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    if (!accessToken || !refreshToken) {
      throw new Error("Tokens came back empty from spotify!");
    }

    // 3. retrieve spotify profile to get user id
    let spotifyProfile;
    try {
      const profileRes = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      spotifyProfile = await profileRes.json();
    } catch (error) {
      console.error("Error fetching Spotify profile:", error);
      return res.status(500).send("Failed to fetch Spotify profile");
    }

    const spotifyId = spotifyProfile.id;

    return {
      accessToken,
      refreshToken,
      spotifyId,
      expiresAt: new Date(
        Date.now() + tokenData.expires_in * 1000
      ).toISOString(),
    };
  } catch (error) {
    console.log("Error exchanging and storing tokens: " + error);
  }
}

async function handleOAuth(code, parsedState) {
  const tokens = await exchangeCodeForToken(code); // returns plaintext tokens
  const spotifyId = await getSpotifyId(tokens.accessToken); // retrieve spotify id

  if (!tokens.accessToken || !tokens.refreshToken || !spotifyId) {
    console.log("missing tokens or spotify id in handleOAuth!");
    throw new Error("Missing tokens!");
  }

  if (parsedState.flow === "login") {
    return loginWithSpotify(spotifyId, tokens); // searches for existing user - upserts tokens - logs in
  } else if (parsedState.flow === "link") {
    return linkSpotifyAccount(parsedState.nonce, spotifyId, tokens);
  } else {
    throw new Error("Invalid flow");
  }
}

async function loginWithSpotify(spotifyId, tokens) {
  // Find existing supabase user by spotifyId

  const { accessToken, refreshToken, expiresAt } = tokens;

  if (!accessToken || !refreshToken || !expiresAt) {
    throw new Error("Missing tokens in loginWithSpotify!");
  }

  const { data: existing, error: findError } = await supabase
    .from("spotify_users")
    .select("user_id")
    .eq("spotify_user", spotifyId)
    .single();

  if (findError || !existing) {
    throw new Error("No Supabase user linked to this Spotify account");
  }

  const encryptedAccess = crypto.encrypt(accessToken);
  const encryptedRefresh = crypto.encrypt(refreshToken);

  // Upsert new tokens
  const { error: upsertError } = await supabase.from("spotify_users").upsert(
    {
      user_id: existing.user_id,
      spotify_user: spotifyId,
      access_token: encryptedAccess,
      refresh_token: encryptedRefresh,
      expires_at: expiresAt.toISOString(),
    },
    { onConflict: ["user_id"] }
  );

  if (upsertError) throw upsertError;

  // Create Supabase session (admin privilege required)
  const { data: sessionData, error: sessionError } =
    await supabase.auth.admin.createSession({
      user_id: existing.user_id,
    });

  if (sessionError) throw sessionError;

  return { session: sessionData.session };
}

async function linkSpotifyAccount(nonce, spotifyId, tokens) {
  const { accessToken, refreshToken, expiresAt } = tokens;

  if (!accessToken || !refreshToken || !expiresAt) {
    throw new Error("Missing tokens in loginWithSpotify!");
  }

  // Verify nonce
  const { data: linkRecord, error: linkError } = await supabase
    .from("spotify_link_nonces")
    .select("*")
    .eq("nonce", nonce)
    .single();

  if (linkError || !linkRecord) {
    throw new Error("Invalid or expired link request");
  }

  if (new Date(linkRecord.expires_at) < new Date()) {
    throw new Error("Link request has expired");
  }

  // Clean up nonce
  await supabase.from("spotify_link_nonces").delete().eq("nonce", nonce);

  const encryptedAccess = crypto.encrypt(tokens.accessToken);
  const encryptedRefresh = crypto.encrypt(tokens.refreshToken);

  // Store tokens against the Supabase user
  const { error: upsertError } = await supabase.from("spotify_users").upsert(
    {
      user_id: linkRecord.user_id,
      spotify_user: spotifyId,
      access_token: encryptedAccess,
      refresh_token: encryptedRefresh,
      expires_at: expiresAt,
    },
    { onConflict: ["user_id"] }
  );

  if (upsertError) throw upsertError;

  return { success: true };
}

async function getSpotifyId(accessToken) {
  const profileRes = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!profileRes.ok) {
    const err = await profileRes.json();
    throw new Error("Failed to fetch Spotify profile: " + JSON.stringify(err));
  }

  const profile = await profileRes.json();
  if (!profile.id) {
    throw new Error("Error retrieving id from spotify profile!");
  }
  return profile.id;
}

// refreshes token for supabase user
async function refreshAccessToken(refreshToken) {
  // To Do: implement token refresh logic
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    console.log("Error refreshing session");
    return res.status(401).json({ error: "Error refreshing session" });
  }

  return data.session;
}

// refresh token for spotify api
async function refreshSpotifyToken(refreshToken, clientId, clientSecret) {
  console.log("Reached refreshSpotifyToken in service");

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error("Missing parameters!");
  }

  // const decryptedRefreshToken = crypto.decrypt(refreshToken);

  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  try {
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${authString}`,
        },
      }
    );

    // accessToken = response.data.access_token;
    return response; // Contains new access_token and possibly a new refresh_token
  } catch (error) {
    console.error(
      "Error refreshing access token:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function getPlaylistTracks(accessToken, playlistId) {
  const limit = 100; // Spotify's max per request
  let offset = 0;
  let allTracks = [];
  // need to add song ID here
  try {
    while (true) {
      const response = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { limit, offset },
        }
      );

      const items = response.data.items.map((item) => ({
        id: item.track.id,
        name: item.track.name,
        artist: item.track.artists.map((a) => a.name).join(", "),
        album: item.track.album.name,
        added_at: item.added_at,
      }));

      allTracks = allTracks.concat(items);

      // If we got fewer than `limit` items, we’re done
      if (response.data.items.length < limit) break;

      offset += limit;
    }

    return allTracks;
  } catch (error) {
    console.error(
      "Error fetching playlist tracks:",
      error.response?.data || error.message
    );
    throw {
      status: error.response?.status || 500,
      message: error.response?.data || "Failed to fetch playlist tracks",
    };
  }
}

async function getPlaylists(accessToken, offset = 0, limit = 50) {
  try {
    const response = await axios.get(
      "https://api.spotify.com/v1/me/playlists",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { offset, limit },
      }
    );

    // testing - check if we've hit spotify's rate limits
    if (response.status === 429) {
      console.log("Hit spotifys rate limits!!!!");
    }

    return response.data;
  } catch (error) {
    console.error("Spotify API error:", error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      message: error.response?.data || "Failed to fetch playlists",
    };
  }
}

async function getProfileInfo(accessToken) {
  if (!accessToken) {
    throw new Error("Missing access token");
  }
  try {
    const response = await axios.get(`${process.env.SPOTIFY_API_BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // attach token
      },
    });
    return response.data; // Spotify returns user object here
  } catch (error) {
    console.error("Spotify API error:", error.response?.data || error.message);
    throw new Error("Failed to fetch profile info from Spotify");
  }
}

module.exports = {
  authValidation,
  signupUser,
  loginUser,
  refreshAccessToken,
  exchangeCodeForToken,
  handleOAuth,
  getPlaylistTracks,
  getPlaylists,
  getProfileInfo,
  setAuthCookies,
  validateToken,
  refreshSpotifyToken,
};
