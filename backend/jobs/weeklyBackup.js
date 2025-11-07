const cron = require("node-cron");
const { handleWeeklyBackup } = require("../services/backupService.js");
const supabase = require("../utils/supabase/supabaseClient");

// const activeJobs = new Map(); // cron tasks

// runs on server start to re-schedule cron jobs
// gets all weekly backups from supabase
// adds them to activeJobs map in memory
async function scheduleJobs() {
  // To Do:
  // get all backups from supabase where active = true
  // schedule one cron job -
  // const { data, error } = await supabase
  //   .from("weekly_backups")
  //   .select("playlist_id, user_id, playlist_name");

  // if (error || !data) {
  //   console.log("No playlists to backup!");
  //   return;
  // }

  // try {
  //   for (const row of data) {
  //     const playlistId = row.playlist_id;
  //     const userId = row.user_id; // supabase user
  //     const playlistName = row.playlist_name;

  //     if (activeJobs.has(playlistId)) {
  //       console.log("Job already scheduled!");
  //       continue;
  //     }
  //     console.log(
  //       `Scheduling weekly backup for playlist ${playlistName} - ${playlistId}`
  //     );
  //     const task = cron.schedule("0 3 * * 0", async () => {
  //       console.log(`Running weekly backup for playlist ${playlistId}...`);
  //       try {
  //         await handleWeeklyBackup({
  //           supabaseUser: userId,
  //           playlistId: playlistId,
  //           playlistName: playlistName,
  //         });
  //         console.log("Weekly backup completed");
  //       } catch (err) {
  //         console.error("Weekly backup failed", err);
  //         throw err;
  //       }
  //     });
  //     activeJobs.set(playlistId, task);
  //   }
  // } catch (err) {
  //   console.log("Unable to schedule weekly backup: " + err);
  // }
  try {
    // cron.schedule("0 3 * * 0", runJobs);
    cron.schedule("0 * * * *", runJobs);
  } catch (err) {
    console.log("Unable to schedule weekly backup runner: " + err);
    throw new Error("failed to schedule jobs!");
  }
  console.log("scheduled backups!");
}

// helper function which is scheduled as cron job - runs a backup for all active playlists
async function runJobs() {
  console.log("Running all scheduled backup jobs...");

  // retrieve ony the active backups
  const { data, error } = await supabase
    .from("weekly_backups")
    .select("playlist_id, user_id, playlist_name")
    .eq("active", true);

  if (error || !data) {
    console.log("No playlists to backup!");
    return;
  }

  // for each active playlist - run handleWeeklyBackup
  for (const row of data) {
    const playlistId = row.playlist_id;
    const userId = row.user_id;
    const playlistName = row.playlist_name;

    if (!playlistId || !userId || !playlistName) {
      console.log("Invalid data for weekly backup, skipping...");
      continue;
    }

    try {
      await handleWeeklyBackup({
        supabaseUser: userId,
        playlistId: playlistId,
        playlistName: playlistName,
      });
      console.log(`Weekly backup completed for playlist ${playlistId}`);
    } catch (err) {
      console.error("failed to backup playlist " + playlistId + ": " + err);
      throw new Error("failed to backup playlist!");
    }
  }
}

async function scheduleBackup(config) {
  const { supabaseUser, playlistId, playlistName } = config; // the playlist id needs to be playlist id in spotify

  // To Do: check supabase to make sure the limit of 5 playlists has not been exceeded

  // To Do: find playlist in supabase with active = true
  const { data: existingBackups, error } = await supabase
    .from("weekly_backups")
    .select("playlist_id")
    .eq("user_id", supabaseUser);
  // .eq("playlist_id", playlistId);

  if (!error && existingBackups.length >= 5) {
    // let frontend know they cannot exceed the limit
    const limitError = new Error("MAX_BACKUPS_REACHED");
    limitError.code = "MAX_BACKUPS_REACHED"; // custom code for the frontend
    throw limitError;
  }

  const duplicate = existingBackups.find((b) => b.playlist_id === playlistId);

  // active jobs need to contain a supabase user too -> user_id from weekly_backups
  if (duplicate) {
    console.log(`Weekly backup already scheduled for playlist ${playlistId}`);
    const duplicateError = new Error("DUPLICATE_BACKUP");
    duplicateError.code = "DUPLICATE_BACKUP"; // custom code for the frontend
    throw duplicateError;
  }

  // running initial backup
  try {
    await handleWeeklyBackup(config);
    console.log("Initial backup completed");
  } catch (err) {
    console.error("Initial backup failed", err);
    throw err;
  }

  // Run every Monday at 9 AM
  // when called by a cron - is should not be called with an access token to trigger an automatic refresh
  // handleWeeklyBackup - should be called with {supabaseUser, playlistId, playlistName}
  // cron schedule -> 0 9 * * 1 = every monday 9 am
  // const task = cron.schedule("0 3 * * 0", async () => {
  //   console.log(`Running weekly backup for playlist ${playlistId}...`);
  //   try {
  //     await handleWeeklyBackup({ supabaseUser, playlistId, playlistName });
  //     console.log("Weekly backup completed");
  //   } catch (err) {
  //     console.error("Weekly backup failed", err);
  //     throw err;
  //   }
  // });
  // activeJobs.set(playlistId, task);
}

module.exports = {
  scheduleBackup,
  scheduleJobs,
};
