const {
  handleWeeklyBackup,
  handleOneTimeBackup,
} = require("../services/backupService");

const { scheduleBackup } = require("../jobs/weeklyBackup.js");

async function enableWeeklyBackup(req, res) {
  const { userId, playlistId, playlistName, accessToken } = req.body;

  if (!userId || !playlistId || !playlistName || !accessToken) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  console.log(
    "reached enableWeeklyBackup endpoint in backupController. Attempting to call backupService"
  );

  try {
    // Schedule the weekly backup for this playlist
    scheduleBackup({ userId, playlistId, playlistName, accessToken });

    return res.json({ message: "Weekly backup enabled for this playlist" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to enable weekly backup" });
  }
}

async function oneTimeBackup(req, res) {
  console.log("One-time backup endpoint hit");
  const accessToken = req.spotifyAccessToken;
  const playlistId = req.params.playlistId;
  const supabaseUser = req.supabaseUser;
  if (!supabaseUser || !accessToken) {
    console.log("Missing supabaseUser or spotifyTokens in route handler");
    throw new Error("Authentication error");
  }
  try {
    //check playlst id
    if (!playlistId) {
      return res
        .status(400)
        .json({ error: "Missing playlistId parameter in backend" });
    }

    const csv = await handleOneTimeBackup({
      accessToken,
      supabaseUser,
      playlistId,
    });

    res.setHeader("Content-Disposition", "attachment; filename=playlist.csv");
    res.setHeader("Content-Type", "text/csv");
    res.send(csv);
  } catch (error) {
    console.error("Weekly backup error:", error);
    res.status(500).json({ error: "Failed to run weekly backup" });
  }
}

module.exports = { enableWeeklyBackup, oneTimeBackup };
