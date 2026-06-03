const { StatusCodes } = require("http-status-codes");

/** Placeholder until feature handlers ship; auth already passed. */
const notImplemented = (req, res) => {
  res.status(StatusCodes.NOT_IMPLEMENTED).json({
    msg: "Not implemented",
    message: "Not implemented",
  });
};

module.exports = { notImplemented };
