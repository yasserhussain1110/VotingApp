var validator = require('validator');

const app_validator = {
  validateSignUpForm: function (params) {
    errors = {};
    if (!params.email || !validator.isEmail(params.email)) {
      errors.emailError = "Not a valid email";
    }

    if (!params.password || !validator.isAlphanumeric(params.password)) {
      errors.passwordError = "Not a valid password";
    }

    return errors;
  }
};

module.exports = app_validator;
