const express = require("express");
const router = express.Router();
const auth = require("../middleware/authentication");
const validate = require("../middleware/validate");
const { patchMeSchema } = require("../validators/me");
const { getMe, patchMe } = require("../controllers/me");

router.get("/", auth, getMe);
router.patch("/", auth, validate(patchMeSchema), patchMe);

module.exports = router;
