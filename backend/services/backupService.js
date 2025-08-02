const axios = require("axios");
const fs = require("fs");
const path = require("path");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const { BackupLog } = require("../models"); // Optional Sequelize model

const BACKUP_DIR = path.join(__dirname, "..", "backups");

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

function areTracksEqual(t1, t2) {
  return JSON.stringify(t1) === JSON.stringify(t2);
}

async function handleWeeklyBackup({ accessToken, playlistId }) {
  const currentTracks = await fetchPlaylistTracks(accessToken, playlistId);

  // Find last backup CSV
  const backupFiles = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith(playlistId));
  const latestBackup = backupFiles.sort().pop();

  let previousTracks = [];
  if (latestBackup) {
    const raw = fs.readFileSync(path.join(BACKUP_DIR, latestBackup), "utf8");
    const lines = raw.split("\n").slice(1);
    previousTracks = lines.filter(Boolean).map((line) => {
      const [name, artist, album, added_at] = line
        .split(",")
        .map((s) => s.replace(/^"|"$/g, ""));
      return { name, artist, album, added_at };
    });
  }

  if (areTracksEqual(previousTracks, currentTracks)) {
    console.log("No playlist changes detected — skipping backup.");
    return;
  }

  const fileName = `${playlistId}_${
    new Date().toISOString().split("T")[0]
  }.csv`;
  const filePath = path.join(BACKUP_DIR, fileName);

  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: "name", title: "Track Name" },
      { id: "artist", title: "Artist" },
      { id: "album", title: "Album" },
      { id: "added_at", title: "Added At" },
    ],
  });

  await csvWriter.writeRecords(currentTracks);

  if (BackupLog) {
    await BackupLog.create({ playlistId, filename: fileName });
  }

  console.log(`✅ Weekly backup saved: ${fileName}`);
}

module.exports = { handleWeeklyBackup };
