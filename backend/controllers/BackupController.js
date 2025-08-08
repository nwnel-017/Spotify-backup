const { handleWeeklyBackup } = require("../services/backupService");

async function runWeeklyBackup(req, res) {
  try {
    const { playlistId } = req.body;
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!playlistId || !accessToken) {
      return res
        .status(400)
        .json({ error: "Missing playlistId or accessToken" });
    }

    const result = await handleWeeklyBackup({ accessToken, playlistId });
    return res.json(result);
  } catch (error) {
    console.error("Weekly backup error:", error);
    res.status(500).json({ error: "Failed to run weekly backup" });
  }
}

module.exports = { runWeeklyBackup };
