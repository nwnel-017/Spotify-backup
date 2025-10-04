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
    console.log(`New backup inserted for playlist ${playlistName}`);
  } catch (error) {
    console.error("Error during weekly backup:", error);
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
  const { data, error } = await supabase.from("weekly_backups").select("*");

  if (error) {
    console.error("Error fetching backups:", error);
    throw new Error("Failed to fetch backups");
  }

  return data;
}

async function createAndFillPlaylist(
  accessToken,
  userId,
  playlistName,
  trackIds
) {
  if (!playlistName || !trackIds || !accessToken || !userId) {
    console.log("Missing params in backup service!");
    throw new Error("Error in Service - missing params to create playlist");
  }
  try {
    const playlistId = await createNewPlaylist(
      accessToken,
      userId,
      playlistName
    );
    await addTracksToPlaylist(accessToken, playlistId, trackIds);
    console.log("Playlist successfully restored!");
  } catch (error) {
    throw new Error("Error creating the restored playlist: " + error.message);
  }
}

async function createNewPlaylist(accessToken, userId, playlistName) {
  if (!accessToken || !playlistName || !userId) {
    throw new Error("Missing playlist name!");
  }

  const now = new Date(Date.now());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const year = now.getFullYear();
  const formattedDate = `${month}/${day}/${year}`;

  const name = `${playlistName} - Restored ${formattedDate}`;

  // To Do : we still need to grab spotify ID from middleware params
  // and userId from middleware
  try {
    const res = await axios.post(
      `${process.env.SPOTIFY_API_BASE_URL}/users/${userId}/playlists`,
      {
        name,
        description: "Restored by SpotSave",
        public: false,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data.id; // the new playlist id
  } catch (error) {
    console.error(
      "Spotify API error:",
      JSON.stringify(error.response.data, null, 2)
    );

    throw new Error("Error creating restored playlist: " + error.response.data);
  }
}

async function addTracksToPlaylist(accessToken, playlistId, trackIds) {
  if (!accessToken || !playlistId || !trackIds) {
    throw new Error("Error restoring tracks to the playlist - missing params!");
  }
  const batchSize = 100; // max amount of songs spotify allows adding

  for (let i = 0; i < trackIds.length; i += batchSize) {
    const curBatch = trackIds.slice(i, i + batchSize);
    const uris = curBatch.map((id) => `spotify:track:${id}`);

    try {
      await axios.post(
        `${process.env.SPOTIFY_API_BASE_URL}/playlists/${playlistId}/tracks`,
        {
          uris,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error(
        "Spotify API error while adding tracks:",
        error.response
          ? JSON.stringify(error.response.data, null, 2)
          : error.message
      );
      throw new Error("Error adding tracks to playlist");
    }
  }
}

module.exports = {
  handleWeeklyBackup,
  handleOneTimeBackup,
  retrieveBackups,
  removeBackup,
  createAndFillPlaylist,
};
