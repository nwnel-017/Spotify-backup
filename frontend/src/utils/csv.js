// /src/utils/csv.js

function getFileName(playlistName) {
  if (!playlistName) {
    throw new Error("Playlist name is required to generate file name");
  }

  try {
    const timestamp = getFileTimeStamp(playlistName);
    return `${playlistName}_${timestamp}.csv`;
  } catch (error) {
    console.error("Error generating file name:", error);
    return "playlist_backup.csv";
  }
}

function getFileTimeStamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}_${month}_${day}`;
}

module.exports = { getFileName };
