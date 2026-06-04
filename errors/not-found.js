const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./custom-api");

class NotFoundError extends CustomAPIError {
  constructor(message = "Resource not found", options = {}) {
    super(message, options);
    this.statusCode = StatusCodes.NOT_FOUND;
    this.code = options.code || "NOT_FOUND";
  }
}

module.exports = NotFoundError;
