const express = require("express");
const router = express.Router();
const {
  enableWeeklyBackup,
  oneTimeBackup,
} = require("../controllers/BackupController");
const authMiddleware = require("../middleware/authMiddleware");

// POST /api/backup/weekly
router.post("/weekly", authMiddleware, enableWeeklyBackup);

// POST /api/backup/single
router.post("/single", authMiddleware, oneTimeBackup);

module.exports = router;
