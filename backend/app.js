// app.js
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,

  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  // optionsSuccessStatus: 200, // <- handles preflight automatically
};

// Middlewares
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// app.options("*", (req, res) => {
//   res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL);
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   res.sendStatus(204);
// });

// last resort - manual cors handling
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });
// app.options("*", cors(corsOptions)); //this throws an error in express
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
