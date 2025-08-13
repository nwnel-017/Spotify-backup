// /services/spotifyAuth.js
require("dotenv").config();
const axios = require("axios");

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

function getAuthHeader() {
  return { Authorization: `Bearer ${accessToken}` };
}

function startTokenRefresh() {
  fetchAccessToken();
  setInterval(fetchAccessToken, TOKEN_REFRESH_INTERVAL);
}

async function exchangeCodeForToken(code, redirect_uri) {
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  try {
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirect_uri,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${authString}`,
        },
      }
    );

    return response; // Contains access_token, refresh_token, expires_in
  } catch (error) {
    console.error(
      "❌ Error exchanging code for token:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// Example API wrapper
async function searchTracks(query) {
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
    query
  )}&type=track`;
  const { data } = await axios.get(url, { headers: getAuthHeader() });
  return data;
}

module.exports = {
  startTokenRefresh,
  getAuthHeader,
  searchTracks,
  exchangeCodeForToken,
};
