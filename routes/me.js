const createProtectedRouter = require("./createProtectedRouter");
const validate = require("../middleware/validate");
const { patchMeSchema } = require("../validators/me");
const { getMe, patchMe } = require("../controllers/me");

const router = createProtectedRouter();

router.get("/", getMe);
router.patch("/", validate(patchMeSchema), patchMe);

module.exports = router;
