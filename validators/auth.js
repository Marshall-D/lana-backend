const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().trim().min(3).max(50).required().messages({
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name must be at most 50 characters",
    "any.required": "Please provide name",
  }),
  email: Joi.string().trim().lowercase().email().required().messages({
    "string.email": "Please provide a valid email",
    "any.required": "Please provide email",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Please provide password",
  }),
  deviceId: Joi.string().trim().optional(),
}).unknown(false);

module.exports = { registerSchema };
