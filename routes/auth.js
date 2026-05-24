// routes/auth.js

const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const auth = require("../middleware/authentication");
const {
  register,
  login,
  refresh,
  revoke,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth");

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    msg: "Too many password reset requests, please try again later",
    message: "Too many password reset requests, please try again later",
  },
});

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password", passwordResetLimiter, resetPassword);
router.post("/refresh", refresh);
// Revoke refresh session without Bearer (e.g. access expired, client skips refresh before sign-out)
router.post("/revoke", revoke);
router.post("/logout", auth, logout);

module.exports = router;
