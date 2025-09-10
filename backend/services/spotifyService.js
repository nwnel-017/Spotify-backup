// /services/spotifyAuth.js
require("dotenv").config();
const axios = require("axios");
const supabase = require("../utils/supabase/supabaseClient");
const jwt = require("jsonwebtoken");

let accessToken = "";
const tokenUrl = process.env.SPOTIFY_TOKEN_URL;
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const TOKEN_REFRESH_INTERVAL = 3500 * 1000; // ~58 minutes

async function fetchAccessToken() {
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  try {
    const response = await axios.post(
      tokenUrl,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    accessToken = response.data.access_token;
    console.log("✅ Spotify access token refreshed");
  } catch (error) {
    console.error(
      "❌ Error fetching Spotify token:",
      error.response?.data || error.message
    );
  }
}

async function exchangeAndStoreTokens(code, state) {
  //Sign the JWT token and get userId
  let decoded, userId;
  try {
    decoded = jwt.verify(state, process.env.SUPABASE_JWT_SECRET);
    userId = decoded.userId;
  } catch (err) {
    console.error("Invalid or expired state JWT:", err);
    throw new Error("Invalid state parameter");
  }

  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  //exchange code for tokens from spotify
  let tokens;
  try {
    tokens = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: `${process.env.REDIRECT_URI}`, //not defined
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${authString}`,
        },
      }
    );
  } catch (error) {
    console.error(
      "❌ Error exchanging code for token:",
      error.response?.data || error.message
    );
    throw error;
  }

  const { access_token, refresh_token, expires_in } = tokens.data;

  //store tokens in supabase
  try {
    const response = await supabase.from("spotify_users").upsert(
      {
        user_id: userId,
        access_token,
        refresh_token,
        expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
      },
      { onConflict: ["user_id"] } // ensures update if user_id exists
    );
  } catch (error) {
    console.error("Error saving Spotify tokens to supabase:", error);
    throw new Error("Failed to save Spotify tokens to server");
  }
  return { access_token, refresh_token, expires_in };
}

async function refreshAccessToken(refreshToken) {
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
    console.log("response from refreshing token in service: " + response.data);

    // accessToken = response.data.access_token;
    return response; // Contains new access_token and possibly a new refresh_token
  } catch (error) {
    console.error(
      "❌ Error refreshing access token:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function storeTokens(userId, accessToken, refreshToken, expiresIn) {
  // Implement storing tokens in your database (e.g., Supabase)
  const expires_at = new Date(Date.now() + expires_in * 1000).toISOString();

  const { data, error } = await supabase.from("spotify_users").upsert(
    {
      user_id: userId,
      access_token,
      refresh_token,
      expires_at,
    },
    { onConflict: ["user_id"] } // ensures update if user_id exists
  );

  if (error) {
    console.error("Error saving Spotify tokens:", error);
    throw new Error("Failed to save Spotify tokens");
  }

  return data;
}

async function getPlaylistTracks(accessToken, playlistId) {
  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const items = response.data.items.map((item) => ({
      name: item.track.name,
      artist: item.track.artists.map((a) => a.name).join(", "),
      album: item.track.album.name,
      added_at: item.added_at,
    }));

    return items;
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      message: error.response?.data || "Failed to fetch playlist tracks",
    };
  }
}

async function getPlaylists(accessToken) {
  try {
    const response = await axios.get(
      "https://api.spotify.com/v1/me/playlists",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
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
  refreshAccessToken,
  exchangeAndStoreTokens,
  getPlaylistTracks,
  getPlaylists,
  getProfileInfo,
};
