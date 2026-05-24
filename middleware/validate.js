const { BadRequestError } = require("../errors");

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const msg = error.details.map((detail) => detail.message).join(", ");
    throw new BadRequestError(msg);
  }

  req.body = value;
  next();
};

module.exports = validate;
