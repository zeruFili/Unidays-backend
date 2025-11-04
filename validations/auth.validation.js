const joi = require('joi');

const signupSchema = {
  body: joi.object().keys({
    first_name: joi.string().min(1).required(),
    last_name: joi.string().min(1).required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
    phone_number: joi.string().required(),
    role: joi.string().valid('super_admin', 'admin', 'student', 'company').default('student'),
    profileImage: joi.string().uri().allow('').default(''),
  }),
};

const loginSchema = {
  body: joi.object().keys({
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
  }),
};

const forgotPasswordSchema = {
  body: joi.object().keys({
    email: joi.string().email().required(),
  }),
};

const resetPasswordSchema = {
  body: joi.object().keys({
    password: joi.string().min(6).required(),
  }),
};

const verifyEmailSchema = {
  body: joi.object().keys({
    code: joi.string().required(),
  }),
};

const updateUserProfileSchema = {
  body: joi.object().keys({
    first_name: joi.string().min(1),
    last_name: joi.string().min(1),
    email: joi.string().email(),
    phone_number: joi.string(),
    profileImage: joi.string().uri().allow(''),
    role: joi.string().valid('super_admin', 'admin', 'student', 'company'),
  }).min(1),
};

const deleteUserSchema = {
  params: joi.object().keys({
    userId: joi.string().required(),
  }),
};

const refreshTokenSchema = {
  body: joi.object().keys({
    refreshToken: joi.string().required(),
  }),
};

module.exports = {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  updateUserProfileSchema,
  deleteUserSchema,
  refreshTokenSchema,
};