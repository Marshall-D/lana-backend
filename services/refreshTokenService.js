// services/refreshTokenService.js

const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const RefreshToken = require("../models/RefreshToken");
const User = require("../models/User");

const OBJECT_ID_HEX_LEN = 24;

function getRefreshTtlMs() {
  const raw =
    process.env.JWT_REFRESH_EXPIRES ||
    process.env.JWT_REFRESH_LIFETIME ||
    "15m";
  const m = String(raw).trim().match(/^(\d+)([smhd])$/i);
  if (!m) return 15 * 60 * 1000;
  const n = parseInt(m[1], 10);
  const u = m[2].toLowerCase();
  const mult = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return n * (mult[u] || mult.d);
}

/**
 * Opaque refresh format: `<24-char hex ObjectId>.<secret>` so we can findById then bcrypt.compare(secret, tokenHash).
 */
function parseOpaqueRefresh(raw) {
  if (!raw || typeof raw !== "string") return null;
  if (raw.length <= OBJECT_ID_HEX_LEN + 1) return null;
  if (raw[OBJECT_ID_HEX_LEN] !== ".") return null;
  const id = raw.slice(0, OBJECT_ID_HEX_LEN);
  const secret = raw.slice(OBJECT_ID_HEX_LEN + 1);
  if (!/^[a-f0-9]{24}$/i.test(id) || !secret) return null;
  return { id, secret };
}

async function issueRefreshToken(userId, deviceId = null) {
  const plainSecret = crypto.randomBytes(32).toString("base64url");
  const salt = await bcrypt.genSalt(10);
  const tokenHash = await bcrypt.hash(plainSecret, salt);
  const expiresAt = new Date(Date.now() + getRefreshTtlMs());

  const doc = await RefreshToken.create({
    userId,
    tokenHash,
    expiresAt,
    deviceId: deviceId || null,
  });

  return `${doc._id.toString()}.${plainSecret}`;
}

async function validateAndRotateRefresh(rawOpaque) {
  const parsed = parseOpaqueRefresh(rawOpaque);
  if (!parsed) {
    return { ok: false, reason: "invalid" };
  }

  const doc = await RefreshToken.findById(parsed.id);
  if (!doc || doc.revokedAt) {
    return { ok: false, reason: "invalid" };
  }
  if (doc.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }

  const match = await bcrypt.compare(parsed.secret, doc.tokenHash);
  if (!match) {
    return { ok: false, reason: "invalid" };
  }

  const user = await User.findById(doc.userId);
  if (!user) {
    return { ok: false, reason: "invalid" };
  }

  doc.revokedAt = new Date();
  await doc.save();

  const newRaw = await issueRefreshToken(user._id, doc.deviceId);

  return {
    ok: true,
    user,
    refreshToken: newRaw,
  };
}

async function revokeByOpaqueIfOwned(rawOpaque, userId) {
  const parsed = parseOpaqueRefresh(rawOpaque);
  if (!parsed) return false;

  const doc = await RefreshToken.findById(parsed.id);
  if (!doc || String(doc.userId) !== String(userId)) {
    return false;
  }
  if (doc.revokedAt) return true;

  const match = await bcrypt.compare(parsed.secret, doc.tokenHash);
  if (!match) return false;

  doc.revokedAt = new Date();
  await doc.save();
  return true;
}

/**
 * Revoke a refresh session using only the opaque token (no access JWT).
 * Used when the client cannot refresh access before sign-out (LANA-103 gap).
 * Idempotent: already-revoked row with matching secret → ok.
 * Invalid secret / wrong id → not ok (caller should 401).
 */
async function revokeByOpaqueSession(rawOpaque) {
  const parsed = parseOpaqueRefresh(rawOpaque);
  if (!parsed) {
    return { ok: false, reason: "invalid" };
  }

  const doc = await RefreshToken.findById(parsed.id);
  if (!doc) {
    return { ok: false, reason: "invalid" };
  }

  const match = await bcrypt.compare(parsed.secret, doc.tokenHash);
  if (!match) {
    return { ok: false, reason: "invalid" };
  }

  if (doc.revokedAt) {
    return { ok: true, idempotent: true };
  }

  if (doc.expiresAt.getTime() < Date.now()) {
    doc.revokedAt = new Date();
    await doc.save();
    return { ok: true, idempotent: true };
  }

  doc.revokedAt = new Date();
  await doc.save();
  return { ok: true };
}

async function revokeAllForUser(userId) {
  await RefreshToken.updateMany(
    { userId, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
}

module.exports = {
  parseOpaqueRefresh,
  issueRefreshToken,
  validateAndRotateRefresh,
  revokeByOpaqueIfOwned,
  revokeByOpaqueSession,
  revokeAllForUser,
};
