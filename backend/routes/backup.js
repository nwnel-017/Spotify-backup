const express = require("express");
const router = express.Router();
const {
  enableWeeklyBackup,
  oneTimeBackup,
} = require("../controllers/BackupController");
const authMiddleware = require("../middleware/authMiddleware");
const spotifyAuthMiddleware = require("../middleware/spotifyAuthMiddleware");

// POST /api/backup/weekly
router.post("/weekly", authMiddleware, enableWeeklyBackup);

// POST /api/backup/single/id
router.post(
  "/single/:playlistId",
  authMiddleware,
  spotifyAuthMiddleware,
  oneTimeBackup
);

module.exports = router;
