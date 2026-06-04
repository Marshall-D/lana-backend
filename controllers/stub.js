const { StatusCodes } = require("http-status-codes");
const { sendError } = require("../utils/errorResponse");

/** Placeholder until feature handlers ship; auth already passed. */
const notImplemented = (req, res) =>
  sendError(res, StatusCodes.NOT_IMPLEMENTED, {
    message: "Not implemented",
    code: "NOT_IMPLEMENTED",
  });

module.exports = { notImplemented };
