import cron from "node-cron";
import fetch from "node-fetch"; // if not already using axios

// Runs every Monday at 9 AM
cron.schedule("0 9 * * 1", async () => {
  console.log("Running weekly playlist backup...");

  try {
    // Call your existing backup logic for all playlists
    await fetch("http://localhost:5000/api/backup/weekly", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SPOTIFY_ACCESS_TOKEN}`, // store securely
      },
      body: JSON.stringify({
        playlistId: "your-playlist-id",
        playlistName: "Your Playlist Name",
      }),
    });

    console.log("✅ Weekly backup completed");
  } catch (err) {
    console.error("❌ Weekly backup failed", err);
  }
});
