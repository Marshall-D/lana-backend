const Joi = require("joi");

const patchMeSchema = Joi.object({
  name: Joi.string().trim().min(3).max(50).messages({
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name must be at most 50 characters",
  }),
})
  .min(1)
  .unknown(false)
  .messages({
    "object.min": "Provide at least one field to update",
  });

module.exports = { patchMeSchema };
