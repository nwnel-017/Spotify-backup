const spotifyService = require("../services/spotifyService");

exports.search = async (req, res) => {
  try {
    const results = await spotifyService.searchTracks(req.query.q);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginUser = (req, res) => {
  const scope = "playlist-read-private playlist-read-collaborative";
  const redirect_uri = process.env.REDIRECT_URI;
  const queryParams = new URLSearchParams({
    response_type: "code",
    scope: scope,
    redirect_uri: redirect_uri,
    client_id: process.env.SPOTIFY_CLIENT_ID,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
};

exports.handleCallback = async (req, res) => {
  console.log("Handling Spotify callback");
  const code = req.query.code || null;
  const redirect_uri = process.env.REDIRECT_URI;

  try {
    const response = await spotifyService.exchangeCodeForToken(
      //this hasnt been implemented yet
      code,
      redirect_uri
    );

    const { access_token } = response.data;

    // Redirect to frontend with the access token
    res.redirect(`http://localhost:3000/home?access_token=${access_token}`); // To Do: do not put access token in url
  } catch (error) {
    console.error(
      "Error getting tokens",
      error.response?.data || error.message
    );
    res.status(400).json({ error: "Failed to get tokens" });
  }
};
