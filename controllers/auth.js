const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const register = async (req, res) => {
  // normalize incoming email to lower-case and trimmed
  const payload = {
    ...req.body,
    email: req.body.email ? req.body.email.trim().toLowerCase() : undefined,
  };

  const user = await User.create(payload);
  const token = user.createJWT();
  res
    .status(StatusCodes.CREATED)
    .json({ user: { name: user.name, email: user.email }, token });
};

const login = async (req, res) => {
  console.log("[AUTH] login body:", req.body); // debug log
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  // normalize email used to find user
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    console.log("[AUTH] user not found for:", normalizedEmail);
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    console.log("[AUTH] password mismatch for:", normalizedEmail);
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const token = user.createJWT();
  res
    .status(StatusCodes.OK)
    .json({ user: { name: user.name, email: user.email }, token });
};

module.exports = {
  register,
  login,
};
