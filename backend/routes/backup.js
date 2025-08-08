const express = require("express");
const router = express.Router();
const { runWeeklyBackup } = require("../controllers/BackupController");

// POST /api/backup/weekly
router.post("/weekly", runWeeklyBackup);

module.exports = router;
