const express = require("express");
const router = express.Router();
const {
  handleWeeklyBackupController,
} = require("../controllers/BackupController");

// POST /api/backup/weekly
router.post("/weekly", handleWeeklyBackupController);

module.exports = router;
