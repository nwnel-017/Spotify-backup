const express = require("express");
const router = express.Router();
const { runWeeklyBackup } = require("../controllers/BackupController");
const authMiddleware = require("../middleware/authMiddleware");

// POST /api/backup/weekly
router.post("/weekly", authMiddleware, runWeeklyBackup);

module.exports = router;
