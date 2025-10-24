const axios = require("axios");
const supabase = require("../utils/supabase/supabaseClient.js");
const spotifyService = require("../services/spotifyService.js");
const crypto = require("../utils/crypto.js");
const { access } = require("fs");

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

  if (error || !data) {
    console.error("Error fetching Spotify tokens:", error);
    return res.status(403).json({ error: "Spotify not linked" });
  }
  let { access_token, refresh_token, expires_at, spotify_user } = data; //tokens are encrypted here

  let decryptedRefreshToken;
  let decryptedAccessToken;

  try {
    decryptedRefreshToken = crypto.decrypt(refresh_token);
    decryptedAccessToken = crypto.decrypt(access_token);

    // Check if access token is expired
    // Refresh the access token
    // Store the new token in supabase
    if (new Date() >= new Date(expires_at)) {
      console.log("Access token expired, refreshing...");
      const newToken = await spotifyService.refreshSpotifyToken(
        decryptedRefreshToken,
        process.env.SPOTIFY_CLIENT_ID,
        process.env.SPOTIFY_CLIENT_SECRET
      );

      decryptedAccessToken = newToken.data.access_token; // not encrypted

      const newEncryptedToken = crypto.encrypt(decryptedAccessToken); // encrypt to store in db
      const expires_in = newToken.data.expires_in; // new expiration

      // Calculate new expiry time
      expires_at = new Date(Date.now() + expires_in * 1000).toISOString();

      if (!newEncryptedToken || !expires_at) {
        throw new Error("Error encrypting new access token in middleware!");
      }

      // Update tokens in Supabase
      // tokens in supabase are encrypted
      const { error: updateError } = await supabase
        .from("spotify_users")
        .update({
          access_token: newEncryptedToken,
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
    }
  } catch (error) {
    console.log("Error verifying access token:", error);
    return res.status(500).json({ error: "Failed to verify token" });
  }

  if (!access_token || !spotify_user) {
    console.log("missing tokens or user id during refresh in middleware");
    return res.status(401).json({ message: "Error decrypting tokens!" });
  }
  //Attach Spotify user data to the request
  req.spotifyId = spotify_user;
  req.spotifyAccessToken = decryptedAccessToken; // should be a decrypted token
  req.spotifyTokenExpiry = expires_at;
  next();
};
