module.exports = restoreBackupMiddleware = (req, res, next) => {
  console.log("Restore backup middleware reached");

  // To Do: using the playlistId from req.body, fetch the backup from Supabase
  // validations
  // attach raw JSONB to req object as playlistContent

  next();
};
