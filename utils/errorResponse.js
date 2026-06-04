/**
 * Standard API error envelope.
 * @param {{ message: string, code?: string, errors?: Array<{ field: string, message: string }> }} payload
 */
function buildErrorBody({ message, code, errors }) {
  const body = {
    success: false,
    message,
  };
  if (code) body.code = code;
  if (errors && errors.length > 0) body.errors = errors;
  return body;
}

function sendError(res, statusCode, payload) {
  return res.status(statusCode).json(buildErrorBody(payload));
}

module.exports = { buildErrorBody, sendError };
