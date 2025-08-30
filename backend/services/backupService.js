const crypto = require("crypto");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
// const createCsvWriter = require("csv-writer").createObjectCsvWriter;

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

// function areTracksEqual(t1, t2) {
//   return JSON.stringify(t1) === JSON.stringify(t2);
// }

// Compute SHA-256 hash of a playlist
function getPlaylistHash(tracks) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(tracks))
    .digest("hex");
}

async function handleWeeklyBackup({ accessToken, playlistId }) {
  console.log("reached backupService.js endpoint");
  try {
    const currentTracks = await fetchPlaylistTracks(accessToken, playlistId);
    const currentHash = getPlaylistHash(currentTracks);

    // Get last backup from Supabase
    // const { data: lastBackup, error: fetchError } = await supabase
    //   .from("weekly_backups")
    //   .select("hash")
    //   .eq("user_id", userId)
    //   .eq("playlist_id", playlistId)
    //   .order("created_at", { ascending: false })
    //   .limit(1)
    //   .single();

    // if (fetchError && fetchError.code !== "PGRST116") {
    //   // ignore "no rows found"
    //   throw fetchError;
    // }

    // // If hash matches last backup, skip insert
    // if (lastBackup && lastBackup.hash === currentHash) {
    //   console.log(
    //     `No changes detected for playlist ${playlistName} — skipping backup.`
    //   );
    //   return;
    // }

    // Insert new backup
    // const { data, error: insertError } = await supabase
    //   .from("weekly_backups")
    //   .insert([
    //     {
    //       user_id: userId,
    //       playlist_id: playlistId,
    //       playlist_name: playlistName,
    //       backup_data: currentTracks,
    //       hash: currentHash,
    //     },
    //   ]);

    // if (insertError) throw insertError;
    console.log(`✅ New backup inserted for playlist ${playlistName}`);
  } catch (error) {
    console.error("Error during weekly backup:", error);
  }
  // Find last backup CSV
  // const backupFiles = fs
  //   .readdirSync(BACKUP_DIR)
  //   .filter((f) => f.startsWith(playlistId));
  // const latestBackup = backupFiles.sort().pop();

  // let previousTracks = [];
  // if (latestBackup) {
  //   const raw = fs.readFileSync(path.join(BACKUP_DIR, latestBackup), "utf8");
  //   const lines = raw.split("\n").slice(1);
  //   previousTracks = lines.filter(Boolean).map((line) => {
  //     const [name, artist, album, added_at] = line
  //       .split(",")
  //       .map((s) => s.replace(/^"|"$/g, ""));
  //     return { name, artist, album, added_at };
  //   });
  // }

  // if (areTracksEqual(previousTracks, currentTracks)) {
  //   console.log("No playlist changes detected — skipping backup.");
  //   return;
  // }

  // const fileName = `${playlistId}_${
  //   new Date().toISOString().split("T")[0]
  // }.csv`;
  // const filePath = path.join(BACKUP_DIR, fileName);

  // const csvWriter = createCsvWriter({
  //   path: filePath,
  //   header: [
  //     { id: "name", title: "Track Name" },
  //     { id: "artist", title: "Artist" },
  //     { id: "album", title: "Album" },
  //     { id: "added_at", title: "Added At" },
  //   ],

  await csvWriter.writeRecords(currentTracks);

  // if (BackupLog) {
  //   await BackupLog.create({ playlistId, filename: fileName });
  // }

  console.log(`✅ Weekly backup saved: ${fileName}`);
}

async function handleOneTimeBackup(req, res) {
  const { accessToken, playlistId } = req.body;

  if (!accessToken || !playlistId) {
    return res.status(400).json({ error: "Missing accessToken or playlistId" });
  }

  try {
    const tracks = await fetchPlaylistTracks(accessToken, playlistId);
    const fileName = `${playlistId}_one_time_backup_${Date.now()}.csv`;
    const filePath = path.join(BACKUP_DIR, fileName);
  } catch (error) {
    console.error("Error during one-time backup:", error);
    return res.status(500).json({ error: "Failed to perform one-time backup" });
  }
}

module.exports = { handleWeeklyBackup, handleOneTimeBackup };
