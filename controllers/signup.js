const conf = require('../services/conf');
const mongo = require('mongodb').MongoClient;
const validator = require('../validators/validator');
const _ = require('lodash');

var dbUrl = conf.dbUrl;

module.exports = {
  get: function (req, res) {
    if (req.session.user) {
      res.redirect('/home');
    } else {
      res.render('signup');
    }
  },

  post: function (req, res) {
    if (req.session.user) {
      res.redirect('/home');
      return;
    }

    var tentativeUser = {};
    tentativeUser.email = req.body.email;
    tentativeUser.password = req.body.password;

    var validationErrors = validator.validateSignUpForm(tentativeUser);

    if (_.isEmpty(validationErrors)) {

      var onCreationSuccessful = function (user) {
        req.session.user = user;
        res.redirect('/home');
      };

      var onUserExists = function () {
        res.render('signup', {errorMsg: tentativeUser.email + " is already taken."});
      };

      var onOtherError = function () {
        res.status(500).send("Something broke");
      };

      createNewUser(tentativeUser, onCreationSuccessful, onUserExists, onOtherError);
    } else {
      res.render('signup', {
        errors: validationErrors,
        userParams: tentativeUser
      });
    }
  }
};


function createNewUser(user, onCreationSuccessful, onUserExists, onOtherError) {
  mongo.connect(dbUrl, function (err, db) {
    const usersCollection = db.collection("users");
    usersCollection.insert({email: user.email, password: user.password}, function (err, data) {
      if (!err) {
        onCreationSuccessful(data.ops[0]);
      } else if (err.code === 11000) {
        onUserExists();
      } else {
        console.log("Weird Situation");
        onOtherError();
      }

      db.close();
    });
  });
}
