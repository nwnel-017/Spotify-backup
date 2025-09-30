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
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(req.cookies["sb-access-token"]);

    if (error || !user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    req.supabaseUser = user.id;

    next();
  } catch (error) {
    console.error("Middleware error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
