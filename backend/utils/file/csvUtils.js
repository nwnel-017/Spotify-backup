const { Parser } = require("json2csv");

function tracksToCsv(tracks) {
  if (!tracks || tracks.length === 0) {
    throw new Error("No tracks available to convert to CSV");
  }
  try {
    const fields = ["track.name", "track.artists[0].name", "track.album.name"];
    const opts = { fields };
    const parser = new Parser(opts);
    return parser.parse(tracks);
  } catch (err) {
    console.error("Error converting tracks to CSV:", err);
    throw err;
  }
}

module.exports = { tracksToCsv };
