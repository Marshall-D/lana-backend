// routes/auth.js

const express = require("express");
const router = express.Router();
const auth = require("../middleware/authentication");
const {
  register,
  login,
  refresh,
  getMe,
  revoke,
  logout,
} = require("../controllers/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.get("/me", auth, getMe);
// Revoke refresh session without Bearer (e.g. access expired, client skips refresh before sign-out)
router.post("/revoke", revoke);
router.post("/logout", auth, logout);

module.exports = router;
