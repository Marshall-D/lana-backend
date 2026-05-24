const Joi = require("joi");

const patchMeSchema = Joi.object({
  name: Joi.string().trim().min(3).max(50),
})
  .min(1)
  .unknown(false);

module.exports = { patchMeSchema };
