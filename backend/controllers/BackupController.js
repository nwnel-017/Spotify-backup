const {
  handleWeeklyBackup,
  handleOneTimeBackup,
  retrieveBackups,
} = require("../services/backupService");

const { scheduleBackup } = require("../jobs/weeklyBackup.js");

async function getMyBackups(req, res) {
  console.log("get my backups endpoint has been reached!");

  const { supabaseUser, spotifyAccessToken } = req;

  if (!supabaseUser || !spotifyAccessToken) {
    throw new Error("Missing tokens from middleware!");
  }

  try {
    const backups = await retrieveBackups({
      accessToken: spotifyAccessToken,
      supabaseUser: supabaseUser,
    });

    res.status(200).json(backups);
  } catch (error) {
    console.error("Error in getMyBackups:", error.message);
    res.status(500).json({ error: "Failed to fetch backups" });
  }
}

async function enableWeeklyBackup(req, res) {
  console.log("Enable weekly backup endpoint hit"); //reached

  const { playlistId, playlistName } = req.body;
  const { supabaseUser, spotifyAccessToken } = req;

  console.log("Request body:", req.body); // weve only got playlistId

  if (!playlistId || !supabaseUser || !spotifyAccessToken) {
    throw new Error("Missing required parameters in request body");
  }

  try {
    await scheduleBackup({
      supabaseUser,
      spotifyAccessToken,
      playlistId,
      playlistName,
    });

    return res.json({ message: "Weekly backup enabled for this playlist" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to enable weekly backup" });
  }
}

async function oneTimeBackup(req, res) {
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

module.exports = { enableWeeklyBackup, oneTimeBackup, getMyBackups };
