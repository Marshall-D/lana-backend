// controllers/auth.js

const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const refreshTokenService = require("../services/refreshTokenService");

/** Same shape as login/register — canonical for startup validation (LANA-105). */
function toPublicUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
  };
}

async function buildAuthResponse(user, deviceId = null) {
  const refreshToken = await refreshTokenService.issueRefreshToken(
    user._id,
    deviceId
  );
  return {
    token: user.createJWT(),
    refreshToken,
    user: toPublicUser(user),
  };
}

const register = async (req, res) => {
  const deviceId = req.body.deviceId || null;
  const payload = {
    ...req.body,
    email: req.body.email ? req.body.email.trim().toLowerCase() : undefined,
  };
  delete payload.deviceId;

  const user = await User.create(payload);
  const body = await buildAuthResponse(user, deviceId);
  res.status(StatusCodes.CREATED).json(body);
};

const login = async (req, res) => {
  const { email, password, deviceId } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  const body = await buildAuthResponse(user, deviceId || null);
  res.status(StatusCodes.OK).json(body);
};

const refresh = async (req, res) => {
  const { refreshToken: raw } = req.body;
  if (!raw || typeof raw !== "string") {
    throw new BadRequestError("Please provide refreshToken");
  }

  const result = await refreshTokenService.validateAndRotateRefresh(raw);
  if (!result.ok) {
    throw new UnauthenticatedError("Invalid refresh token");
  }

  const { user, refreshToken } = result;
  res.status(StatusCodes.OK).json({
    token: user.createJWT(),
    refreshToken,
    user: toPublicUser(user),
  });
};

/**
 * GET /api/v1/auth/me — validate Bearer access JWT + return user snapshot.
 * Canonical URL for useStartup / validateWithServer until GET /api/v1/me exists (LANA-201).
 */
const getMe = async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  if (!user) {
    throw new UnauthenticatedError("Authentication invalid");
  }
  res.status(StatusCodes.OK).json({ user: toPublicUser(user) });
};

/**
 * POST /api/v1/auth/revoke — revoke this refresh session without a valid access JWT.
 * Body: { refreshToken }. Validates opaque token (bcrypt); 401 if invalid.
 * 200 { success: true } when revoked or already revoked (idempotent).
 * Use when access is expired and the client will not call /refresh before clearing storage.
 */
const revoke = async (req, res) => {
  const { refreshToken: raw } = req.body;
  if (!raw || typeof raw !== "string") {
    throw new BadRequestError("Please provide refreshToken");
  }

  const result = await refreshTokenService.revokeByOpaqueSession(raw);
  if (!result.ok) {
    throw new UnauthenticatedError("Invalid refresh token");
  }

  res.status(StatusCodes.OK).json({ success: true });
};

/**
 * POST /api/v1/auth/logout — requires valid Bearer access JWT.
 * Optional body { refreshToken }: revoke that session if owned by user; else revoke all refresh sessions for user.
 */
const logout = async (req, res) => {
  const userId = req.user.userId;
  const raw = req.body && req.body.refreshToken;

  if (raw && typeof raw === "string") {
    await refreshTokenService.revokeByOpaqueIfOwned(raw, userId);
  } else {
    await refreshTokenService.revokeAllForUser(userId);
  }

  res.status(StatusCodes.OK).json({ success: true });
};

module.exports = {
  register,
  login,
  refresh,
  getMe,
  revoke,
  logout,
};
