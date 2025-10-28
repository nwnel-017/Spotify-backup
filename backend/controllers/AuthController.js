const authService = require("../services/authService");

exports.getSession = async (req, res) => {
  console.log("Attempting to retrieve session!");

  try {
    const userId = authService.validateToken(req);
    console.log("user retrieved from getSession: " + userId);
    return res.status(200).json({ user: userId }); // send the user back
  } catch (error) {
    return res.status(401).json({ message: "Not authenticated!" });
  }
};

exports.refreshToken = async (req, res) => {
  console.log("hit refreshToken controller!"); /// hit here
  try {
    const refreshToken = req.cookies?.["sb-refresh-token"];
    if (!refreshToken) {
      console.log("refresh token was not found in cookies");
      return res.status(401).json({ message: "Error: no refresh token!" });
    }

    const newTokens = authService.refreshAccessToken(refreshToken);
    await authService.setAuthCookies(res, newTokens);
    return res
      .status(200)
      .json({ message: "Access token has been refreshed!" });
  } catch (error) {
    console.log("Error refreshing token: " + error);
    return res.status(500).json({ message: "Failed to refresh token!" });
  }
};

exports.signup = async (req, res) => {
  console.log("reached backend signup!");

  const { email, password } = req.body;

  try {
    const { sanitizedEmail, sanitizedPassword } = authService.authValidation(
      email,
      password
    );
    {
    }

    if (!sanitizedEmail || !sanitizedPassword) {
      return res.status(400).json({ message: "Error signing up!" });
    }

    await authService.signupUser(sanitizedEmail, sanitizedPassword);
    return res.status(200).json({ message: "success!" });
  } catch (error) {
    console.log("Error in signup process: " + error); // getSupabase is not a function
    return res.status(500).json({ message: "Error signing up!" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // validate input
    const { sanitizedEmail, sanitizedPassword } = authService.authValidation(
      email,
      password
    );

    if (!sanitizedEmail || !sanitizedPassword) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    const session = await authService.loginUser(
      sanitizedEmail,
      sanitizedPassword
    );

    // retrieve user from supabase
    authService.setAuthCookies(res, session);
    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    if (error.status === 401 && error.code === "USER_NOT_VERIFIED") {
      console.log("controller has found user to not be verified"); // hit here
      return res.status(401).json({ message: error.code });
    } else if (error.status === 400 && error.code === "USER_NOT_FOUND") {
      return res.status(400).json({ message: error.code });
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

exports.verifyUser = async (req, res) => {
  console.log("Hit /verifyUser route");

  const { token } = req.query;
  if (!token) {
    console.log("error - missing access token!");
    return res.status(400).json({ message: "Missing credentials!" });
  }

  try {
    const session = await authService.verifyUser(token);
    authService.setAuthCookies(res, session);
    return res.redirect(`${process.env.CLIENT_URL}/home?firstTimeUser=${true}`);
  } catch (error) {
    console.log("error verifying user: " + error);
    return res.status(500).json({
      message: "Failed to verify user! Verification email may be expired",
    });
  }
};

exports.logout = async (req, res) => {
  console.log("logging out user...");

  try {
    authService.clearAuthCookies(res);
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to end session" });
  }
};
