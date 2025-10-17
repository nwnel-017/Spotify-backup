const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

// uses multer to grab the file and attaches to the req
// basic validation -> file must be a csv and cannot exceed size limit
const restoreCsvMiddleware = (req, res, next) => {
  const singleUpload = upload.single("file"); // field name in frontend FormData

  singleUpload(req, res, (err) => {
    if (err) {
      console.log("Error from multer middleware: " + err.message);
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      console.log("No req.file has been provided!");
      return res.status(400).json({ error: "CSV file is required" });
    }
    const playlistName = req.body.playlistName;
    if (!playlistName) {
      return res.status(400).json({ error: "Playlist name is required" });
    }
    req.playlistName = playlistName;
    try {
      console.log("req.file info:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });
      // Convert buffer to string so controller can parse it
      const csvContent = req.file.buffer.toString("utf-8");

      // split into rows, trim, and filter out empty lines
      const rows = csvContent
        .split(/\r?\n/)
        .map((r) => r.trim())
        .filter(Boolean);
      console.log("rows:", rows);

      const trackIds = rows.filter((id) => /^[A-Za-z0-9]{22}$/.test(id)); // validating track ids

      if (trackIds.length === 0) {
        console.log("No valid track IDs found");
        return res
          .status(400)
          .json({ error: "No valid track IDs found in CSV" });
      }

      req.trackIds = trackIds;
      req.playlistName = playlistName;
    } catch (e) {
      console.log("Error trying to parse file! ");
      return res.status(500).json({ error: "Failed to process file" });
    }
    next();
  });
};

module.exports = restoreCsvMiddleware;
