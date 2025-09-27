require("dotenv").config();

// const app = express();
const app = require("./app");

const PORT = 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running at http://192.168.0.4:${PORT}`);
});
