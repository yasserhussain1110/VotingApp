const conf = require('../services/conf');
const mongo = require('mongodb').MongoClient;

var dbUrl = conf.dbUrl;

module.exports = {
  get: function (req, res) {
    if (req.session.user) {
      res.redirect('/home');
    } else {
      res.render('login');
    }
  },

  post: function (req, res) {
    if (req.session.user) {
      res.redirect('/home');
      return;
    }

    var onAuthSuccess = function (user) {
      req.session.user = user;
      res.redirect('/home');
    };

    var onAuthFailure = function () {
      res.render('login', {errorMsg: "Email or password invalid"});
    };

    authenticateUser(req.body, onAuthSuccess, onAuthFailure);
  }
};

function authenticateUser(loginParams, onAuthSuccess, onAuthFailure) {
  if (!loginParams.email || !loginParams.password) {
    onAuthFailure();
    return;
  }

  mongo.connect(dbUrl, function (err, db) {
    const usersCollection = db.collection("users");
    usersCollection.find({email: loginParams.email, password: loginParams.password}).toArray(function (err, users) {
      if (users.length == 0) {
        onAuthFailure();
      } else {
        onAuthSuccess(users[0]);
      }
      db.close();
    });
  });
}

