// app.js
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,

  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  // allowedHeaders: "*",
  // optionsSuccessStatus: 200, // <- handles preflight automatically
};

// Middlewares
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.set("trust proxy", 1); // maybe this is confusing cors

//Routes
const spotifyRoutes = require("./routes/spotify"); // Import the Spotify routes
app.use("/api/spotify", spotifyRoutes); // Use the Spotify routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
const backupRoutes = require("./routes/backup"); // Import the backup routes
app.use("/api/backup", backupRoutes); // Routes for backup operations

module.exports = app;
