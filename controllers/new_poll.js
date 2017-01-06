const conf = require('../services/conf');
const validator = require('../validators/validator');
const _ = require('lodash');
const mongo = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

var dbUrl = conf.dbUrl;

module.exports = {
  get: function (req, res) {
    if (!req.session.user) {
      res.redirect('/login');
      return;
    }
    res.render('new_poll');
  },
  post: function (req, res) {
    if (!req.session.user) {
      res.redirect('/login');
      return;
    }
    var reqParams = req.body;
    var validationErrors = validator.validateNewPollForm(reqParams);
    if (_.isEmpty(validationErrors)) {
      var onPollExists = function () {
        res.status(400).send("Poll already exists");
      };

      var onSuccess = function () {
        res.render('new_poll', {success: true});
      };
      insertNewPollInDB(req.session.user._id, reqParams, onPollExists, onSuccess);
    } else {
      res.render('new_poll', {error: validationErrors});
    }
  }
};

function insertNewPollInDB(userId, reqParams, onPollExists, onSuccess) {
  mongo.connect(dbUrl, function (err, db) {
    const pollsCollection = db.collection("polls");
    pollsCollection.insert({
      question: reqParams.question,
      answers: createChoiceList(reqParams),
      createdBy: userId,
      answeredBy: []
    }, function (err, data) {
      if (!err) {
        onSuccess();
      } else if (err.code === 11000) {
        onPollExists();
      } else {
        console.log("Weird Situation");
      }
      db.close();
    });
  });
}

function createChoiceList(reqParams) {
  var choices = [];
  var requestKeys = Object.keys(reqParams);
  for (var i = 0; i < requestKeys.length; i++) {
    if (/^choice\d+$/.test(requestKeys[i])) {
      choices.push(reqParams[requestKeys[i]]);
    }
  }

  var choiceSet = new Set(choices);
  var choiceList = [];

  choiceSet.forEach(function (eachChoice) {
    choiceList.push({
      choice: eachChoice,
      votes: 0
    });
  });

  return choiceList;
}
