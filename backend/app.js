// app.js
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// ✅ Apply CORS here (before routes)
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Middlewares (JSON parsing, etc.)
app.use(express.json());
app.use(cookieParser());

app.set("trust proxy", 1); // 🛠️ Add this before routes

//Routes
const spotifyRoutes = require("./routes/spotify"); // Import the Spotify routes
app.use("/api/spotify", spotifyRoutes); // Use the Spotify routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
const backupRoutes = require("./routes/backup"); // Import the backup routes
app.use("/api/backup", backupRoutes); // Routes for backup operations

module.exports = app; // ✅ exported for testing
