const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./custom-api");

class UnauthenticatedError extends CustomAPIError {
  constructor(message = "Authentication invalid", options = {}) {
    super(message, options);
    this.statusCode = StatusCodes.UNAUTHORIZED;
    this.code = options.code || "UNAUTHORIZED";
  }
}

module.exports = UnauthenticatedError;
