require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const authMiddleware = require("./middleware/authMiddleware");
const { startTokenRefresh } = require("./services/spotifyService.js");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

startTokenRefresh();

//Routes
const spotifyRoutes = require("./routes/spotify"); // Import the Spotify routes
app.use("/api/spotify", spotifyRoutes); // Use the Spotify routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
const backupRoutes = require("./routes/backup"); // Import the backup routes
app.use("/api/backup", backupRoutes); // Routes for backup operations

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running at http://192.168.0.4:${PORT}`);
});
