const axios = require("axios");
const jwt = require("jsonwebtoken");
const supabase = require("../utils/supabase/supabaseClient");

// retrieve JWT from headers and verify
// get user id from decoded JWT
// lookup spotify tokens in supabase with user id
// verify both tokens exist
// attach spotify tokens and supabase user info to req object
module.exports = async function (req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const supabaseToken = authHeader?.split(" ")[1]; // "Bearer <token>"

    // Verify Supabase JWT
    let decoded;
    try {
      decoded = jwt.verify(supabaseToken, process.env.SUPABASE_JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "JWT expired or invalid" });
    }
    req.supabaseUser = decoded.sub; // contains `sub`, `email`, etc.

    next();
  } catch (error) {
    console.error("Middleware error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
