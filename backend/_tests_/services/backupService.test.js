const cron = require("node-cron");
const {
  scheduleBackup,
  cancelWeeklyBackup,
} = require("../../jobs/weeklyBackup");
const { handleWeeklyBackup } = require("../../services/backupService");

jest.mock("node-cron", () => ({
  schedule: jest.fn(() => ({
    stop: jest.fn(),
  })),
}));

jest.mock("../../services/backupService", () => ({
  handleWeeklyBackup: jest.fn(),
}));

describe("weeklyBackup scheduler", () => {
  const config = {
    userId: "user_1",
    playlistId: "playlist123",
    playlistName: "My Playlist",
    accessToken: "token",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should schedule a new backup", () => {
    scheduleBackup(config);

    expect(cron.schedule).toHaveBeenCalledWith(
      "0 9 * * 1",
      expect.any(Function)
    );
  });

  it("should not schedule duplicate jobs", () => {
    scheduleBackup(config);
    scheduleBackup(config); // second call

    expect(cron.schedule).toHaveBeenCalledTimes(1);
  });

  it("should cancel a scheduled backup", () => {
    const task = { stop: jest.fn() };
    cron.schedule.mockReturnValueOnce(task);

    scheduleBackup(config);
    cancelWeeklyBackup("playlist123");

    expect(task.stop).toHaveBeenCalled();
  });
});
