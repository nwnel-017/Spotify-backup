const axios = require("axios");
const supabase = require("../utils/supabase/supabaseClient.js");
const spotifyService = require("../services/spotifyService.js");
const { access } = require("fs");

// retrieve user id and retrieve tokens from supabase
// get user id from decoded JWT
// lookup spotify tokens in supabase with user id
// verify both tokens exist
// attach spotify tokens and supabase user info to req object
module.exports = async function spotifyAuthMiddleware(req, res, next) {
  const userId = req.supabaseUser;

  // console.log("spotifyAuthMiddleware userId:", userId); // correct
  // console.log(typeof userId, userId); // string

  // Lookup Spotify tokens
  const { data, error } = await supabase
    .from("spotify_users")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .single();

  console.log("response from supabase: ", data, error);

  if (error || !data) {
    console.error("Error fetching Spotify tokens:", error);
    return res.status(403).json({ error: "Spotify not linked" });
  }
  let { access_token, refresh_token, expires_at } = data;

  // Check if access token is expired
  if (new Date() >= new Date(expires_at)) {
    console.log("Access token expired, refreshing...");
    // Refresh the access token
    // Store the new token in supabase
    try {
      const newToken = await spotifyService.refreshAccessToken(
        refresh_token,
        process.env.SPOTIFY_CLIENT_ID,
        process.env.SPOTIFY_CLIENT_SECRET
      );

      access_token = newToken.data.access_token;
      const expires_in = newToken.data.expires_in;

      // Calculate new expiry time
      expires_at = new Date(Date.now() + expires_in * 1000).toISOString();

      // Update tokens in Supabase
      const { error: updateError } = await supabase
        .from("spotify_users")
        .update({
          access_token: access_token,
          expires_at: expires_at,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating tokens in Supabase:", updateError);
        return res.status(500).json({ error: "Failed to update tokens" });
      } else {
        console.log("Spotify tokens updated successfully");
      }
    } catch (error) {
      console.log("Error refreshing access token:", error);
      return res.status(500).json({ error: "Failed to refresh token" });
    }
  }

  //Attach Spotify user data to the request
  req.spotifyAccessToken = access_token;
  req.spotifyRefreshToken = refresh_token;
  req.spotifyTokenExpiry = expires_at;
  next();
};
