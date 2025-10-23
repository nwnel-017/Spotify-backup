const cron = require("node-cron");
const { handleWeeklyBackup } = require("../services/backupService.js");
const supabase = require("../utils/supabase/supabaseClient");

const activeJobs = new Map(); // cron tasks

// runs on server start to re-schedule cron jobs
async function scheduleJobs() {
  const { data, error } = await supabase
    .from("weekly_backups")
    .select("playlist_id, user_id, playlist_name");

  if (error || !data) {
    console.log("No playlists to backup!");
    return;
  }

  try {
    for (const row of data) {
      const playlistId = row.playlist_id;
      const userId = row.user_id; // supabase user
      const playlistName = row.playlist_name;

      if (activeJobs.has(playlistId)) {
        console.log("Job already scheduled!");
        continue;
      }
      console.log(
        `Scheduling weekly backup for playlist ${playlistName} - ${playlistId}`
      );
      const task = cron.schedule("0 9 * * 1", async () => {
        console.log(`Running weekly backup for playlist ${playlistId}...`);
        try {
          await handleWeeklyBackup({
            supabaseUser: userId,
            playlistId: playlistId,
            playlistName: playlistName,
          });
          console.log("Weekly backup completed");
        } catch (err) {
          console.error("Weekly backup failed", err);
          throw err;
        }
      });
      activeJobs.set(playlistId, task);
    }
  } catch (err) {
    console.log("Unable to schedule weekly backup: " + err);
  }
  console.log("scheduled backups!");
}

async function scheduleBackup(config) {
  const { supabaseUser, playlistId, playlistName } = config; // the playlist id needs to be playlist id in spotify

  // To Do: check supabase to make sure the limit of 5 playlists has not been exceeded

  if (activeJobs.has(playlistId)) {
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
  const task = cron.schedule("0 9 * * 1", async () => {
    console.log(`Running weekly backup for playlist ${playlistId}...`);
    try {
      await handleWeeklyBackup({ supabaseUser, playlistId, playlistName });
      console.log("Weekly backup completed");
    } catch (err) {
      console.error("Weekly backup failed", err);
      throw err;
    }
  });
  activeJobs.set(playlistId, task);
}

//cancel a weekly backup
// found the issue -> this playlistId is the "id" field in supabase - but the playlist keys are spotify's playlistId - playlist_id in supabase
// fix so that this is called with spotify's playlist_id
function cancelWeeklyBackup(playlistId) {
  // for some reason this is a separate instance of the module then schedule Backup
  if (activeJobs.has(playlistId)) {
    activeJobs.get(playlistId).stop();
    activeJobs.delete(playlistId);
    console.log(`Canceled weekly backup for playlist ${playlistId}`);
  }
}

module.exports = {
  scheduleBackup,
  cancelWeeklyBackup,
  scheduleJobs,
};
