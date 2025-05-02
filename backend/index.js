require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let accessToken = "";

const getSpotifyAccessToken = async () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const tokenUrl = "https://accounts.spotify.com/api/token";
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );
  //testing - things are working - but spotify things redirect URI is insecure
  console.log("Spotify Client ID:", clientId);
  console.log("Spotify Client Secret:", clientSecret);
  try {
    const response = await axios.post(
      tokenUrl,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    accessToken = response.data.access_token;
    console.log("Spotify access token fetched!");
  } catch (error) {
    console.error("Error getting Spotify token", error.response.data);
  }
};

// Refresh token when server starts
getSpotifyAccessToken();

//Routes
const spotifyRoutes = require("./routes/spotify"); // Import the Spotify routes
app.use("/api/spotify", spotifyRoutes); // Use the Spotify routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running at http://192.168.0.4:${PORT}`);
});
