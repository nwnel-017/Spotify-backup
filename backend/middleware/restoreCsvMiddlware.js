module.exports = restoreCsvMiddleware = (req, res, next) => {
  console.log("Restore CSV middleware reached");

  // To Do: use Multer.js to validate csv
  // parse into an array of track IDs and attach to req object as trackIds

  next();
};
