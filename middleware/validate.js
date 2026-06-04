const { BadRequestError } = require("../errors");

function joiFieldErrors(error) {
  return error.details.map((detail) => ({
    field: detail.path.join(".") || "body",
    message: detail.message.replace(/"/g, ""),
  }));
}

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = joiFieldErrors(error);
    const message = errors.map((e) => e.message).join(", ");
    throw new BadRequestError(message || "Validation failed", {
      code: "VALIDATION_ERROR",
      errors,
    });
  }

  req.body = value;
  next();
};

module.exports = validate;
