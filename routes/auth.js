// routes/auth.js
// Public auth endpoints — do not apply router-level auth on this mount.
// Protected: POST /logout only (per-route auth).

const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const auth = require("../middleware/authentication");
const validate = require("../middleware/validate");
const { registerSchema } = require("../validators/auth");
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
    success: false,
    message: "Too many password reset requests, please try again later",
    code: "RATE_LIMITED",
  },
});

router.post("/register", validate(registerSchema), register);
router.post("/login", login);
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password", passwordResetLimiter, resetPassword);
router.post("/refresh", refresh);
// Revoke refresh session without Bearer (e.g. access expired, client skips refresh before sign-out)
router.post("/revoke", revoke);
router.post("/logout", auth, logout);

module.exports = router;
