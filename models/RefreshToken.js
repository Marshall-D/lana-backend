// models/RefreshToken.js

const mongoose = require("mongoose");

const RefreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  tokenHash: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  revokedAt: {
    type: Date,
    default: null,
  },
  deviceId: {
    type: String,
    default: null,
  },
});

RefreshTokenSchema.index({ userId: 1, revokedAt: 1 });

module.exports = mongoose.model("RefreshToken", RefreshTokenSchema);
