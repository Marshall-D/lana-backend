const { StatusCodes } = require("http-status-codes");
const { sendError } = require("../utils/errorResponse");

const notFound = (req, res) =>
  sendError(res, StatusCodes.NOT_FOUND, {
    message: "Route does not exist",
    code: "ROUTE_NOT_FOUND",
  });

module.exports = notFound;
