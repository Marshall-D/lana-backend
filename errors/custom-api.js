class CustomAPIError extends Error {
  constructor(message, { code, errors } = {}) {
    super(message);
    this.code = code;
    this.errors = errors;
  }
}

module.exports = CustomAPIError;
