const { handleWeeklyBackup } = require("../services/backupService");

exports.handleWeeklyBackupController = async (req, res) => {
  const { playlistId } = req.body;
  const accessToken = req.headers.authorization?.split(" ")[1]; // Bearer token

  if (!playlistId || !accessToken) {
    return res.status(400).json({ error: "Missing playlistId or accessToken" });
  }

  try {
    await handleWeeklyBackup({ accessToken, playlistId });
    res.status(200).json({ message: "Weekly backup completed successfully." });
  } catch (err) {
    console.error("Backup error:", err.message);
    res.status(500).json({ error: "Weekly backup failed." });
  }
};
