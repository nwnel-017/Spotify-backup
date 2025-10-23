const express = require("express");
const router = express.Router();
const {
  enableWeeklyBackup,
  oneTimeBackup,
  getMyBackups,
  deleteBackup,
} = require("../controllers/BackupController");
const {
  restorePlaylist,
  fileRestore,
} = require("../controllers/spotifyController");
const authMiddleware = require("../middleware/authMiddleware");
const spotifyAuthMiddleware = require("../middleware/spotifyAuthMiddleware");
const restoreCsvMiddleware = require("../middleware/restoreCsvMiddleware");
const { rest, auth } = require("../utils/supabase/supabaseClient");

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

// restoring with OAuth (can restore to any account)
router.post("/restore/:id", authMiddleware, restorePlaylist);

// POST /api/backup/upload
router.post(
  "/upload",
  authMiddleware,
  spotifyAuthMiddleware,
  restoreCsvMiddleware,
  // restorePlaylist
  fileRestore
);

router.delete(
  "/delete/:playlistId",
  authMiddleware,
  spotifyAuthMiddleware,
  deleteBackup
);

module.exports = router;
