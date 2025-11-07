const crypto = require("crypto");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const spotifyService = require("./spotifyService"); // created a circular dependancy
const supabase = require("../utils/supabase/supabaseClient");
const { tracksToCsv } = require("../utils/file/csvUtils");
const { generateHash, decrypt } = require("../utils/crypto");

const BACKUP_DIR = path.join(__dirname, "..", "backups");

// Ensure backup folder exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

async function fetchPlaylistTracks(accessToken, playlistId) {
  const tracks = [];
  let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;

  try {
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
  } catch (fetchError) {
    console.error("Error fetching playlist tracks:", fetchError);
    throw new Error(fetchError);
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
  console.log("hit handleWeeklyBackup for playlist " + playlistName);
  try {
    let validToken = spotifyAccessToken; // only passed in when user initially schedules a weekly backup

    const { data: tokenData, error: tokenError } = await supabase
      .from("spotify_users")
      .select("refresh_token, spotify_user")
      .eq("user_id", supabaseUser)
      .single();
    if (
      tokenError ||
      !tokenData ||
      !tokenData.refresh_token ||
      !tokenData.spotify_user
    ) {
      console.log("Error retrieving refresh token");
      throw new Error("Failed to fetch refresh token!");
    }

    const spotifyId = tokenData.spotify_user;

    if (!validToken) {
      console.log(
        "not called with an access token. initiating automatica refresh"
      );
      // const { data: tokenData, error: tokenError } = await supabase
      //   .from("spotify_users")
      //   .select("refresh_token")
      //   .eq("user_id", supabaseUser)
      //   .single();

      // if (tokenError || !tokenData || !tokenData.refresh_token) {
      //   console.log("Error retrieving refresh token");
      //   throw new Error("Failed to fetch refresh token!");
      // }

      // To Do: decrypt token first
      let decrypted;
      try {
        decrypted = decrypt(tokenData.refresh_token);
      } catch (cryptoError) {
        console.log(
          "Error decrypting refresh token during weekly backup: " + cryptoError
        );
        throw new Error("Error decrypting refresh token during weekly backup!");
      }

      const clientId = process.env.SPOTIFY_CLIENT_ID || "";
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "";

      // this is failing
      const tokenResponse = await spotifyService.refreshSpotifyToken(
        decrypted,
        clientId,
        clientSecret
      );

      const refreshedToken = tokenResponse?.data?.access_token;

      if (!refreshedToken) {
        throw new Error("Unable to refresh token!");
      }
      validToken = refreshedToken;
    } else {
      console.log("valid access token provided");
    }

    // verify playist still exists - if not - disable backup from continuing weekly
    // To do: make call to GET https://api.spotify.com/v1/playlists/${playlist_id}/followers/contains?ids=${user_spotify_id}
    // either returns true or false
    try {
      const followerRes = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}/followers/contains?ids=${spotifyId}`,
        {
          headers: { Authorization: `Bearer ${validToken}` },
        }
      );

      if (!followerRes.data[0]) {
        console.log(
          `playlist ${playlistName} not found for user ${spotifyId}, disabling backup...`
        );
        await supabase // ok this worked - but now every playlist got disabled
          .from("weekly_backups")
          .update({ active: false })
          .eq("playlist_id", playlistId)
          .eq("user_id", supabaseUser);
        return;
      }

      console.log("playlist found, continuing backup...");
    } catch (existingPlaylistError) {
      console.log("playlist not found: " + existingPlaylistError);
      throw new Error("Error verifying playlist exists");
      // await supabase // ok this worked - but now every playlist got disabled
      //   .from("weekly_backups")
      //   .update({ active: false })
      //   .eq("playlist_id", playlistId)
      //   .eq("user_id", supabaseUser);
      // return;
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

    // this error should be moved to the scheduleBackup function when initially scheduling
    // right now if a user has 5 backups this will error every week
    // if (count >= 5) {
    //   // let frontend know they cannot exceed the limit
    //   const limitError = new Error("MAX_BACKUPS_REACHED");
    //   limitError.code = "MAX_BACKUPS_REACHED"; // custom code for the frontend
    //   throw limitError;
    // }

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
            active: true,
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

// test function to see why token refresh isnt working
// async function refreshTokenTest() {
//   const { data, error } = await supabase.from("users").select("id").single();

//   if (error || !data) {
//     throw new Error("didnt get user");
//   }

//   const supabaseUser = data.id;

//   console.log("1.) retrieved supabase id: " + supabaseUser); //success

//   const { data: tokenData, error: tokenError } = await supabase
//     .from("spotify_users")
//     .select("refresh_token")
//     .eq("user_id", supabaseUser)
//     .single();

//   if (tokenError || !tokenData || !tokenData.refresh_token) {
//     console.log("Error retrieving refresh token");
//     throw new Error("Failed to fetch refresh token!");
//   }

//   console.log(
//     "2.) refresh token fetched from supabase: " + tokenData.refresh_token //success
//   );

//   const clientId = process.env.SPOTIFY_CLIENT_ID || "";
//   const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "";

//   // this is failing
//   const tokenResponse = await spotifyService.refreshSpotifyToken(
//     tokenData.refresh_token,
//     clientId,
//     clientSecret
//   );

//   const refreshedToken = tokenResponse?.data?.access_token;

//   if (!refreshedToken) {
//     throw new Error("Unable to refresh token!");
//   }
//   console.log("refreshed token: " + refreshedToken);
// }

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

// were not doing anything with the access token besides checking it exists -> we can remove
// we want the user to be able to manage their backups even if they are not liked to a spotify account (they might have lost access)
async function retrieveBackups(supabaseUser) {
  if (!supabaseUser) {
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
  // refreshTokenTest, //remove later
};
