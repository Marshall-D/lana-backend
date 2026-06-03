const createProtectedRouter = require("./createProtectedRouter");
const { notImplemented } = require("../controllers/stub");

const router = createProtectedRouter();
router.all("*", notImplemented);

module.exports = router;
