const cron = require("node-cron");
const { handleWeeklyBackup } = require("../services/backupService.js");

const activeJobs = new Map(); // cron task

async function scheduleBackup(config) {
  const { playlistId } = config; // the playlist id needs to be playlist id in spotify

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
  const task = cron.schedule("0 9 * * 1", async () => {
    console.log(`Running weekly backup for playlist ${playlistId}...`);
    try {
      await handleWeeklyBackup(config);
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
};
