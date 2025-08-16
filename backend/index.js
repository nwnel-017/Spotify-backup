require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const authMiddleware = require("./middleware/authMiddleware");
const { startTokenRefresh } = require("./services/spotifyService.js");

// const app = express();
const app = require("./app");

const PORT = 5000;

app.use(cors());
app.use(express.json());

startTokenRefresh();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running at http://192.168.0.4:${PORT}`);
});
