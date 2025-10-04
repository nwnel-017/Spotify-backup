const axios = require("axios");
const jwt = require("jsonwebtoken");
const supabase = require("../utils/supabase/supabaseClient");
const spotifyService = require("../services/spotifyService");

// retrieve JWT from headers and verify
// get user id from decoded JWT
// lookup spotify tokens in supabase with user id
// verify both tokens exist
// attach spotify tokens and supabase user info to req object
module.exports = async function (req, res, next) {
  const accessToken = req.cookies["sb-access-token"];
  const refreshToken = req.cookies["sb-refresh-token"];

  if (!accessToken) {
    // no access tokens!
    console.log("missing token in middleware");
    return res.status(440).json({ error: "Not authenticated" });
  }

  const decoded = jwt.decode(accessToken, { complete: true });

  if (!decoded) {
    return res.status(401).json({ error: "Invalid access token!" });
  }

  const exp = decoded.payload.exp * 1000;
  const now = Date.now();

  if (now >= exp) {
    return res.status(401).json({ error: "Access token expired" });
  }

  req.supabaseUser = decoded.payload.sub;

  next();
};
