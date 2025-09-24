const express = require("express");
const router = express.Router();
const {
  enableWeeklyBackup,
  oneTimeBackup,
  getMyBackups,
} = require("../controllers/BackupController");
const authMiddleware = require("../middleware/authMiddleware");
const spotifyAuthMiddleware = require("../middleware/spotifyAuthMiddleware");

router.get("/backups", authMiddleware, spotifyAuthMiddleware, getMyBackups);

// POST /api/backup/weekly
router.post(
  "/weekly",
  authMiddleware,
  spotifyAuthMiddleware,
  enableWeeklyBackup
);

// POST /api/backup/single/id
router.post(
  "/single/:playlistId",
  authMiddleware,
  spotifyAuthMiddleware,
  oneTimeBackup
);

module.exports = router;
