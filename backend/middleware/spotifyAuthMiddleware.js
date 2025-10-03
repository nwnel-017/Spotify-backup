const axios = require("axios");
const supabase = require("../utils/supabase/supabaseClient.js");
const spotifyService = require("../services/spotifyService.js");
const crypto = require("../utils/crypto.js");

// retrieve user id and retrieve tokens from supabase
// get user id from decoded JWT
// lookup spotify tokens in supabase with user id
// verify both tokens exist
// attach spotify tokens and supabase user info to req object
module.exports = async function spotifyAuthMiddleware(req, res, next) {
  const userId = req.supabaseUser;

  // Lookup Spotify tokens
  const { data, error } = await supabase
    .from("spotify_users")
    .select("access_token, refresh_token, expires_at, spotify_user")
    .eq("user_id", userId)
    .single();

  console.log("response from supabase: ", data, error);

  if (error || !data) {
    console.error("Error fetching Spotify tokens:", error);
    return res.status(403).json({ error: "Spotify not linked" });
  }
  let { access_token, refresh_token, expires_at, spotify_user } = data;

  console.log("access token in midware: " + access_token);
  console.log("refresh token in midware: " + refresh_token);

  let decryptedRefreshToken = crypto.decrypt(refresh_token);
  let decryptedAccessToken = crypto.decrypt(access_token);

  console.log("decrypted access token in midware: " + decryptedAccessToken);
  console.log("decrypted refresh token in midware: " + decryptedRefreshToken);

  // Check if access token is expired
  if (new Date() >= new Date(expires_at)) {
    console.log("Access token expired, refreshing...");
    // Refresh the access token
    // Store the new token in supabase
    try {
      const newToken = await spotifyService.refreshSpotifyToken(
        decryptedRefreshToken,
        process.env.SPOTIFY_CLIENT_ID,
        process.env.SPOTIFY_CLIENT_SECRET
      );

      decryptedAccessToken = newToken.data.access_token;
      decryptedRefreshToken = newToken.data.refresh_token;
      access_token = crypto.encrypt(decryptedAccessToken);
      refresh_token = crypto.encrypt(decryptedRefreshToken);
      const expires_in = newToken.data.expires_in;

      // Calculate new expiry time
      expires_at = new Date(Date.now() + expires_in * 1000).toISOString();

      // Update tokens in Supabase
      // tokens in supabase are encrypted
      const { error: updateError } = await supabase
        .from("spotify_users")
        .update({
          access_token: access_token,
          refresh_token: refresh_token,
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

  // const decryptedAccessToken = crypto.decrypt(access_token); // if refreshed - this is not encrypted
  // const decryptedRefreshToken = crypto.decrypt(refresh_token);

  if (!decryptedAccessToken || !decryptedRefreshToken) {
    console.log("missing tokens during refresh in middleware");
    return res.status(401).json({ message: "Error decrypting tokens!" });
  }
  //Attach Spotify user data to the request
  req.spotifyId = spotify_user;
  req.spotifyAccessToken = decryptedAccessToken;
  req.spotifyRefreshToken = decryptedRefreshToken;
  req.spotifyTokenExpiry = expires_at;
  next();
};
