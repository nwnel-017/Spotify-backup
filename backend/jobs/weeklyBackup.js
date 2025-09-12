const cron = require("node-cron");
const { handleWeeklyBackup } = require("../services/backupService.js");

const activeJobs = new Map(); // cron task

async function scheduleBackup(config) {
  const { playlistId } = config;

  if (activeJobs.has(playlistId)) {
    console.log(`Weekly backup already scheduled for playlist ${playlistId}`);
    return;
  }

  // running initial backup
  try {
    await handleWeeklyBackup(config);
    console.log("✅ Initial backup completed");
  } catch (err) {
    console.error("❌ Initial backup failed", err);
  }

  // Run every Monday at 9 AM
  const task = cron.schedule("0 9 * * 1", async () => {
    console.log(`Running weekly backup for playlist ${playlistId}...`);
    try {
      await handleWeeklyBackup(config);
      console.log("✅ Weekly backup completed");
    } catch (err) {
      console.error("❌ Weekly backup failed", err);
    }
  });
  activeJobs.set(playlistId, task);
  console.log(`Scheduled weekly backup for playlist ${playlistId}`);
}

//cancel a weekly backup
function cancelWeeklyBackup(playlistId) {
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
