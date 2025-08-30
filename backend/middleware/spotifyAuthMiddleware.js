const axios = require("axios");
const { supabase } = require("../utils/supabase/supabaseClient.js");
//issue is in here -> the spotify access token isnt being set properly

// retrieve JWT from headers and verify
// get user id from decoded JWT
// lookup spotify tokens in supabase with user id
// verify both tokens exist
// attach spotify tokens and supabase user info to req object
module.exports = async function spotifyAuthMiddleware(req, res, next) {
  const userId = req.supabaseUser.userId;
  console.log("Decoded user ID in middleware:", userId);

  try {
    // Lookup Spotify tokens
    const { data, error } = await supabase
      .from("spotify_users")
      .select("access_token, refresh_token, expires_at")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return res.status(403).json({ error: "Spotify not linked" });
    }

    //Attach Spotify user data to the request
    req.spotifyAccessToken = data.access_token;
    req.spotifyRefreshToken = data.refresh_token;
    req.spotifyTokenExpiry = data.expires_at;
    next();
  } catch (error) {
    console.error("Middleware error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
