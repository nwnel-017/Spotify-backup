const supabase = require("../utils/supabase/supabaseClient.js");

module.exports = restoreBackupMiddleware = async (req, res, next) => {
  console.log("Restore backup middleware reached");
  const userId = req.supabaseUser;
  const playlistId = req.params.playlistId;
  if (!userId || !playlistId) {
    return res
      .status(400)
      .json({ message: "Error - missing app user Id or playlist id" });
  }
  console.log("User id in new middleware: " + userId);
  console.log("Playlist id in middleware: " + playlistId);
  try {
    const { data, error } = await supabase
      .from("weekly_backups")
      .select("playlist_id, playlist_name, backup_data")
      .eq("user_id", userId)
      .eq("id", playlistId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found
        console.log("No rows found in weeky_backups!");
        return res
          .status(404)
          .json({ message: "No backup found for this playlist" });
      }
      throw error;
    }

    const trackIds = (data.backup_data || []).map((track) => track.id);

    console.log("Playlist name: " + data.playlist_name);

    req.trackIds = trackIds;
    req.playlistName = data.playlist_name;

    next();
  } catch (error) {
    console.log("Error retrieving backup from database: " + error);
    res.status(500).json({ message: "Error retrieving backup from database" });
  }
};
