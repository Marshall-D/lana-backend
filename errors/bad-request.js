const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./custom-api");

class BadRequestError extends CustomAPIError {
  constructor(message, options = {}) {
    super(message, options);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

module.exports = BadRequestError;
