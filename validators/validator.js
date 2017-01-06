var validator = require('validator');

const appValidator = {
  validateSignUpForm: function (params) {
    errors = {};
    if (!params.email || !validator.isEmail(params.email)) {
      errors.emailError = "Not a valid email";
    }

    if (!params.password || !validator.isAlphanumeric(params.password)) {
      errors.passwordError = "Not a valid password";
    }

    return errors;
  },

  validateNewPollForm: function (params) {
    errors = {};
    if (!params.question || !params.question.trim()) {
      errors.questionError = "Question cannot be empty";
    }

    var choiceErrors = [];

    var choiceKeys = Object.keys(params).filter(function (param) {
      return /^choice\d+$/.test(param);
    });

    if (choiceKeys.length === 0) {
      choiceErrors.push("Should have at least one choice.");
    }

    choiceKeys.forEach(function (key) {
      var choiceVal = params[key];
      if (!choiceVal || !choiceVal.trim()) {
        choiceErrors.push("Invalid choice '" + choiceVal.replace(/ /g, '&nbsp;') + "' for " + validator.escape(key));
      }
    });

    if (choiceErrors.length > 0) {
      errors.choiceErrors = choiceErrors;
    }

    return errors;
  },

  validateVoteForm: function (params) {
    errors = {};
    if (!params.choice || !params.choice.trim()) {
      errors.choiceError = "Choice cannot be empty";
    }
    return errors;
  }
};

module.exports = appValidator;
