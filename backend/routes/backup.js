const express = require("express");
const router = express.Router();
const {
  enableWeeklyBackup,
  oneTimeBackup,
  getMyBackups,
  deleteBackup,
  restorePlaylist,
} = require("../controllers/BackupController");
const authMiddleware = require("../middleware/authMiddleware");
const spotifyAuthMiddleware = require("../middleware/spotifyAuthMiddleware");
const { rest } = require("../utils/supabase/supabaseClient");

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

// POST /api/backup/restore/id
router.post(
  "/restore/:playlistId",
  authMiddleware,
  spotifyAuthMiddleware,
  restorePlaylist
);

router.delete(
  "/delete/:playlistId",
  authMiddleware,
  spotifyAuthMiddleware,
  deleteBackup
);

module.exports = router;
