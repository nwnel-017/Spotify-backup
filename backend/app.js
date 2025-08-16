// app.js
const express = require("express");
const spotifyController = require("./controllers/spotifyController");

const app = express();

// Middlewares (JSON parsing, etc.)
app.use(express.json());

//Routes
const spotifyRoutes = require("./routes/spotify"); // Import the Spotify routes
app.use("/api/spotify", spotifyRoutes); // Use the Spotify routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
const backupRoutes = require("./routes/backup"); // Import the backup routes
app.use("/api/backup", backupRoutes); // Routes for backup operations

module.exports = app; // ✅ exported for testing
