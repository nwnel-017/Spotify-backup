const {
  handleWeeklyBackup,
  handleOneTimeBackup,
  retrieveBackups,
  removeBackup,
  createSpotifyPlaylist,
} = require("../services/backupService");

const {
  scheduleBackup,
  cancelWeeklyBackup,
} = require("../jobs/weeklyBackup.js");

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

async function deleteBackup(req, res) {
  console.log(
    "Delete backup endpoint hit. attempting to delete playlist: " +
      req.params.playlistId
  );
  try {
    cancelWeeklyBackup(req.params.playlistId);

    await removeBackup(req.params.playlistId);

    return res.status(200).json({ message: "successfully deleted backup" });
  } catch (error) {
    console.error("Error deleting backup:", error);
    return res.status(500).json({ error: "Failed to delete backup" });
  }
}

async function restorePlaylist(req, res) {
  console.log("reached restore playlist controller"); // successfully reached
  // console.log("CSV contents:", req.trackIds); // reached correctly

  const restoreFromDb = !req.trackIds;
  console.log(restoreFromDb);
  let trackIds;
  let playlistName;

  if (restoreFromDb) {
    // To Do: if restoreFromDb - grab jsonb and playlist name from suapabse
    // convert jsonb to track ids
  } else {
    trackIds = req.trackIds;
    playlistName = req.playlistName;
  }

  // if uploadFromBackup, then call we need to convert JSONB to trackIds
  // call spotify API to create a new playlist with `${playlistName} - Restored ${date}`
  // add tracks to this playlist in batches of 100
  // return success / failure message
  console.log("trackIds : " + trackIds);
  console.log("playlist name: " + playlistName);
  if (!trackIds || !playlistName) {
    //both undefined
    console.log("Missing params!");
    return res.status(500).json({
      message: "Error - missing track Ids or playlist name in controller!",
    });
  }

  try {
    await createSpotifyPlaylist(playlistName, trackIds);
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
