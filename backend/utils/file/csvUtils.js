const { Parser } = require("json2csv");

function tracksToCsv(tracks) {
  if (!tracks || tracks.length === 0) {
    throw new Error("No tracks available to convert to CSV");
  }

  try {
    const trackIds = tracks.map((t) => t.id);
    return trackIds.join("\n");
  } catch (err) {
    console.error("Error converting tracks to CSV:", err);
    throw err;
  }
}

module.exports = { tracksToCsv };
