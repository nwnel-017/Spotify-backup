const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { scheduleJobs } = require("./jobs/weeklyBackup");

const app = express();

const corsOptions = {
  origin: [process.env.CLIENT_URL],
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

app.set("trust proxy", 1);

// function to run on server startup - schedules cron jobs for all playlist backups stored in 'weekly_backups'
(async () => {
  try {
    await scheduleJobs();
    console.log("Backup jobs scheduled successfully");
  } catch (error) {
    console.error("Failed to schedule backup jobs:", error);
  }
})();

//Routes
const spotifyRoutes = require("./routes/spotify");
app.use("/api/spotify", spotifyRoutes);
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
const backupRoutes = require("./routes/backup");
app.use("/api/backup", backupRoutes);

module.exports = app;
