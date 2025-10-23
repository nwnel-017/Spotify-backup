const crypto = require("crypto");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const spotifyService = require("./spotifyService"); // created a circular dependancy
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

// checks if access token is provided
// if not - called by weekly cron and we trigger an immediate token refresh
// do not store in spotify_users
async function handleWeeklyBackup({
  supabaseUser,
  spotifyAccessToken,
  playlistId,
  playlistName,
}) {
  try {
    let validToken = spotifyAccessToken; // only passed in when user initially schedules a weekly backup

    if (!validToken) {
      console.log(
        "not called with an access token. initiating automatica refresh"
      );
      const { data: tokenData, error: tokenError } = await supabase
        .from("spotify_users")
        .select("refresh_token")
        .eq("user_id", supabaseUser)
        .single();

      if (!tokenData || tokenError || !tokenData.refresh_token) {
        console.log("Error retrieving refresh token");
        throw new Error("Failed to fetch refresh token!");
      }

      const clientId = process.env.SPOTIFY_CLIENT_ID || "";
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "";

      const { access_token: refreshedToken } =
        await spotifyService.refreshSpotifyToken(
          tokenData.refresh_token,
          clientId,
          clientSecret
        );

      if (!refreshedToken) {
        throw new Error("Unable to refresh token!");
      }
      validToken = refreshedToken;
    } else {
      console.log("valid access token provided");
    }

    const currentTracks = await fetchPlaylistTracks(validToken, playlistId);
    const currentHash = generateHash(currentTracks);

    // Get last backup from Supabase
    // first get all backups for the user to check if they've exceeded the max limit
    // If so - show them the error. If not - retrieve the last backup from the returned rows
    const {
      data: backups,
      error: fetchError,
      count,
    } = await supabase
      .from("weekly_backups")
      .select("hash, playlist_id", { count: "exact" })
      .eq("user_id", supabaseUser)
      .order("created_at", { ascending: false });

    console.log(count + " existing backups have been found: " + backups);

    if (fetchError && fetchError.code !== "PGRST116") {
      // ignore "no rows found"
      throw fetchError;
    }

    if (count >= 5) {
      // let frontend know they cannot exceed the limit
      const limitError = new Error("MAX_BACKUPS_REACHED");
      limitError.code = "MAX_BACKUPS_REACHED"; // custom code for the frontend
      throw limitError;
    }

    const lastBackup = backups.find((b) => b.playlist_id === playlistId);

    // If hash matches last backup, skip insert
    if (lastBackup && lastBackup.hash === currentHash) {
      //not sure if this ever gets hit
      console.log(
        `No changes detected for playlist ${playlistName} — skipping backup.`
      );
      return;
    }
    console.log("inserting new backup into supabase");
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
    console.log(`New backup inserted for playlist ${playlistName}`);
  } catch (error) {
    console.error("Error during weekly backup:", error);
    throw error;
  }

  console.log("Weekly backup saved");
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
  if (!playlistId) {
    throw new Error("No backup ID provided to deleteBackup");
  }

  const { error } = await supabase
    .from("weekly_backups")
    .delete()
    .eq("playlist_id", playlistId);

  if (error) {
    console.error("Error deleting backup from Supabase:", error);
    throw error;
  }
}

async function retrieveBackups({ accessToken, supabaseUser }) {
  if (!accessToken || !supabaseUser) {
    throw new Error("Missing authorization to retrieve backups!");
  }
  const { data, error } = await supabase
    .from("weekly_backups")
    .select("*", { count: "exact" })
    .eq("user_id", supabaseUser);

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
