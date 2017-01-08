const conf = require('../services/conf');
const validator = require('../validators/validator');
const _ = require('lodash');
const mongo = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

var dbUrl = conf.dbUrl;

function getCurrentUrl(req) {
  var proto = req.headers['x-forwarded-proto'] ||
  req.connection.encrypted ? "https" : "http";
  return proto + "://" + req.get('host') + req.originalUrl;
}

function getTwitterLink(req, question) {
  var currentUrl = getCurrentUrl(req);
  var tweet = "FCC Voting | " + question;
  return "https://twitter.com/intent/tweet?url=" + encodeURIComponent(currentUrl) + "&text=" + encodeURIComponent(tweet);
}

const pollController = {
  get: function (req, res) {
    var pollId = req.params.id;
    mongo.connect(dbUrl, function (err, db) {
      const polls = db.collection("polls");
      polls.find({_id: ObjectId(pollId)}, {_id: 0, question: 1, answers: 1}).toArray(function (err, polls) {
        if (polls.length == 0) {
          res.status(404).send("Could not find poll");
        } else {
          var poll = polls[0];
          res.render('poll', {
            question: poll.question,
            answerString: JSON.stringify(poll.answers),
            user: req.session.user,
            twitterLink: getTwitterLink(req, poll.question)
          });
        }
        db.close();
      });
    });
  },

  post: function (req, res) {
    var pollId = req.params.id;
    mongo.connect(dbUrl, function (err, db) {
      const polls = db.collection("polls");
      polls.find({_id: ObjectId(pollId)}).toArray(function (err, polls) {
        doesPollExistAction(err, db, req, res, polls);
        db.close();
      });
    });
  }
};

function doesPollExistAction(err, db, req, res, polls) {
  if (polls.length == 0) {
    res.status(404).send("Could not find poll");
  } else {
    var poll = polls[0];
    validateInputAction(err, db, req, res, poll);
  }
}

function validateInputAction(err, db, req, res, poll) {
  var validationError = validator.validateVoteForm(req.body);
  if (_.isEmpty(validationError)) {
    hasAlreadyAnsweredAction(err, db, req, res, poll);
  } else {
    res.render('poll', {
      error: validationError,
      question: poll.question,
      answerString: JSON.stringify(poll.answers),
      user: req.session.user
    });
  }
}

function hasAlreadyAnsweredAction(err, db, req, res, poll) {
  var answeredBy = poll.answeredBy;
  var userInfo = getUserInfoHelper(req);
  if (alreadyVotedHelper(answeredBy, userInfo)) {
    res.render('poll', {
      error: {
        alreadyVotedError: "This user or ip address has already voted"
      },
      question: poll.question,
      answerString: JSON.stringify(poll.answers),
      user: req.session.user
    });
  } else {
    castVoteAction(err, db, req, res, poll, userInfo);
  }
}

function castVoteAction(err, db, req, res, poll, userInfo) {
  var userChoice = req.body.choice;
  var choiceIndexResult;

  if (choiceIndexResult = getChoiceIndexHelper(userChoice, poll.answers)) {
    poll.answers[choiceIndexResult.index].votes++;
    poll.answeredBy.push(userInfo);
    updateDBAction(err, db, poll._id, poll.answers, poll.answeredBy);
    res.redirect("/poll/" + poll._id);
  } else {
    newChoiceAction(err, db, req, res, poll, userChoice, userInfo);
  }
}

function newChoiceAction(err, db, req, res, poll, userChoice, userInfo) {
  // is logged in
  if (userInfo.userId) {
    poll.answers.push({
      choice: userChoice,
      votes: 1
    });
    poll.answeredBy.push(userInfo);
    updateDBAction(err, db, poll._id, poll.answers, poll.answeredBy);
    res.redirect("/poll/" + poll._id);
  }// not logged in
  else {
    res.status(400).send("Not authorized to create a new choice. Login and Try again.");
  }
}

function getChoiceIndexHelper(userChoice, answers) {
  for (var i = 0; i < answers.length; i++) {
    if (answers[i].choice == userChoice) {
      return {
        success: true,
        index: i
      };
    }
  }
  return false;
}

function updateDBAction(err, db, pollId, answers, answeredBy) {
  const pollsCollection = db.collection("polls");
  pollsCollection.update({_id: pollId}, {
    $set: {
      answers: answers,
      answeredBy: answeredBy
    }
  });
}

function alreadyVotedHelper(usersAlreadyAnswered, userInfo) {
  if (userInfo.userId) {
    for (var i = 0; i < usersAlreadyAnswered.length; i++) {
      var userAlreadyAnswered = usersAlreadyAnswered[i];
      if (userAlreadyAnswered.userId && userAlreadyAnswered.userId == userInfo.userId) {
        return true;
      }
    }
    return false;
  } else if (userInfo.ipAddress) {
    for (var i = 0; i < usersAlreadyAnswered.length; i++) {
      var userAlreadyAnswered = usersAlreadyAnswered[i];
      if (userAlreadyAnswered.ipAddress && !userAlreadyAnswered.userId && userAlreadyAnswered.ipAddress == userInfo.ipAddress) {
        return true;
      }
    }
    return false;
  }
}

function getUserInfoHelper(req) {
  var userInfo = {};
  userInfo.ipAddress = getIpFromReq(req);
  if (req.session.user) {
    userInfo.userId = req.session.user._id;
  }
  return userInfo;
}

function getIpFromReq(req) {
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  return ip
    .replace(/^::ffff:/, '')
    .replace(/,.*/, '');
}

module.exports = pollController;
