const { Parser } = require("json2csv");

function tracksToCsv(tracks) {
  if (!tracks || tracks.length === 0) {
    throw new Error("No tracks available to convert to CSV");
  }
  try {
    // Adjust fields to match the flat structure of the tracks array
    const fields = [
      { label: "Track ID", value: "id" },
      { label: "Track Name", value: "name" },
      { label: "Artist", value: "artist" },
      { label: "Album", value: "album" },
      { label: "Added At", value: "added_at" },
    ];

    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(tracks);
    return csv;
  } catch (err) {
    console.error("Error converting tracks to CSV:", err);
    throw err;
  }
}

module.exports = { tracksToCsv };
