const crypto = require("crypto");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
// const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const spotifyService = require("./spotifyService");
const supabase = require("../utils/supabase/supabaseClient");
const { tracksToCsv } = require("../utils/file/csvUtils");
const { generateHash } = require("../utils/crypto");

const BACKUP_DIR = path.join(__dirname, "..", "backups");

// Ensure backup folder exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

async function fetchPlaylistTracks(accessToken, playlistId) {
  const tracks = [];
  let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;

  while (url) {
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = res.data;
    tracks.push(
      ...data.items.map((item) => ({
        id: item.track.id,
        name: item.track.name,
        artist: item.track.artists.map((a) => a.name).join(", "),
        album: item.track.album.name,
        added_at: item.added_at,
      }))
    );
    url = data.next;
  }

  return tracks;
}

//need to rewrite
async function handleWeeklyBackup({
  supabaseUser,
  spotifyAccessToken,
  playlistId,
  playlistName,
}) {
  try {
    const currentTracks = await fetchPlaylistTracks(
      spotifyAccessToken,
      playlistId
    );
    const currentHash = generateHash(currentTracks);

    console.log("Current hash:", currentHash);
    console.log("user:", supabaseUser);

    // Get last backup from Supabase
    const { data: lastBackup, error: fetchError } = await supabase
      .from("weekly_backups")
      .select("hash")
      .eq("user_id", supabaseUser)
      .eq("playlist_id", playlistId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // ignore "no rows found"
      throw fetchError;
    }

    console.log("last backup:", lastBackup); //last backup is null
    // If hash matches last backup, skip insert
    if (lastBackup && lastBackup.hash === currentHash) {
      //not sure if this ever gets hit
      console.log(
        `No changes detected for playlist ${playlistName} — skipping backup.`
      );
      return;
    }
    console.log("inserting new backup into suapabase");
    //Insert new backup
    const { data, error: insertError } = await supabase
      .from("weekly_backups")
      .upsert(
        [
          {
            user_id: supabaseUser,
            playlist_id: playlistId,
            playlist_name: playlistName,
            backup_data: currentTracks,
            hash: currentHash,
          },
        ],
        { onConflict: ["playlist_id"] }
      );

    if (insertError) throw insertError;
    console.log(`✅ New backup inserted for playlist ${playlistName}`);
  } catch (error) {
    console.error("Error during weekly backup:", error);
  }

  console.log("✅ Weekly backup saved");
}

async function handleOneTimeBackup({ accessToken, supabaseUser, playlistId }) {
  if (!accessToken || !playlistId || !supabaseUser) {
    throw new Error("Missing authentication or playlistId in service");
  }

  try {
    const tracks = await spotifyService.getPlaylistTracks(
      //only 100 were returned
      accessToken,
      playlistId
    );

    const csv = tracksToCsv(tracks);
    return csv;
  } catch (error) {
    throw new Error("Failed to generate one-time backup: " + error.message);
  }
}

async function removeBackup(playlistId) {
  console.log("Hello from backupService.removeBackup");
  if (!playlistId) {
    throw new Error("No backup ID provided to deleteBackup");
  }

  const { error } = await supabase
    .from("weekly_backups")
    .delete()
    .eq("id", playlistId);

  if (error) {
    console.error("Error deleting backup from Supabase:", error);
    throw error;
  }
}

async function retrieveBackups({ accessToken, supabaseUser }) {
  console.log(
    "hit backupService.sj. attempting to retrieve backups from supabase"
  );

  const { data, error } = await supabase.from("weekly_backups").select("*");

  if (error) {
    console.error("Error fetching backups:", error);
    throw new Error("Failed to fetch backups");
  }

  return data;
}

module.exports = {
  handleWeeklyBackup,
  handleOneTimeBackup,
  retrieveBackups,
  removeBackup,
};
