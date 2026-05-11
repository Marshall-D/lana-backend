// controllers/auth.js

const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

function buildAuthResponse(user) {
  return {
    token: user.createJWT(),
    refreshToken: user.createRefreshJWT(),
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    },
  };
}

const register = async (req, res) => {
  // normalize incoming email to lower-case and trimmed
  const payload = {
    ...req.body,
    email: req.body.email ? req.body.email.trim().toLowerCase() : undefined,
  };

  const user = await User.create(payload);
  res.status(StatusCodes.CREATED).json(buildAuthResponse(user));
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  // normalize email used to find user
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  res.status(StatusCodes.OK).json(buildAuthResponse(user));
};

module.exports = {
  register,
  login,
};
