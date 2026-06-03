const express = require("express");
const auth = require("../middleware/authentication");

/** Express router with JWT auth applied to all routes on this mount. */
function createProtectedRouter() {
  const router = express.Router();
  router.use(auth);
  return router;
}

module.exports = createProtectedRouter;
