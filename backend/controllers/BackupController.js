const {
  handleOneTimeBackup,
  retrieveBackups,
  removeBackup,
  createAndFillPlaylist,
} = require("../services/backupService");

const {
  scheduleBackup,
  cancelWeeklyBackup,
} = require("../jobs/weeklyBackup.js");

async function getMyBackups(req, res) {
  const { supabaseUser } = req; // remove spotify access token

  if (!supabaseUser) {
    throw new Error("Missing tokens from middleware!");
  }

  try {
    const backups = await retrieveBackups(supabaseUser);

    res.status(200).json(backups);
  } catch (error) {
    console.error("Error in getMyBackups:", error.message);
    res.status(500).json({ error: "Failed to fetch backups" });
  }
}

async function enableWeeklyBackup(req, res) {
  const { playlistId, playlistName } = req.body;
  const { supabaseUser, spotifyAccessToken } = req;

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
    const status = err.status || 400; // <--- use 400 for expected errors
    const code = err.code || "UNKNOWN_ERROR";
    const message = err.message || "An unexpected error occurred.";

    return res.status(status).json({ code, message });
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

async function deleteBackup(req, res) {
  try {
    cancelWeeklyBackup(req.params.playlistId);

    await removeBackup(req.params.playlistId);

    return res.status(200).json({ message: "successfully deleted backup" });
  } catch (error) {
    console.error("Error deleting backup:", error);
    return res.status(500).json({ error: "Failed to delete backup" });
  }
}

// this should be able to restore - even if we don't have access to a spotify account
async function restorePlaylist(req, res) {
  const accessToken = req.spotifyAccessToken;
  const userId = req.spotifyId;
  const trackIds = req.trackIds;
  const playlistName = req.playlistName;

  if (!accessToken || !userId) {
    return res.status(401).json({ message: "Missing spotify authorization!" });
  }

  if (!trackIds || !playlistName) {
    console.log("Missing params!");
    return res.status(500).json({
      message: "Error - missing track Ids or playlist name in controller!",
    });
  }

  try {
    await createAndFillPlaylist(accessToken, userId, playlistName, trackIds);
    return res.status(200).json({ message: "Sucessfully restored playlist" });
  } catch (error) {
    console.log("Error in Backup Controller: " + error);
    return res.status(500).json({ message: "Error in Backup Controller!" });
  }
}

module.exports = {
  enableWeeklyBackup,
  oneTimeBackup,
  getMyBackups,
  deleteBackup,
  restorePlaylist,
};
