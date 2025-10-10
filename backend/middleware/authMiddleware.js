const axios = require("axios");
const jwt = require("jsonwebtoken");
const supabase = require("../utils/supabase/supabaseClient");
const spotifyService = require("../services/spotifyService");

// 1. call validateToken to validate JWT from cookies
// 2. attach supabaseId to req
// 3. if no valid token, return 401 error
module.exports = async function (req, res, next) {
  try {
    const userId = spotifyService.validateToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Missing access token!" });
    }
    req.supabaseUser = userId;
    next();
  } catch (error) {
    console.log("Auth middleware error: " + error);
    return res.status(401).json({ error: "Error authenticating user!" });
  }
};
