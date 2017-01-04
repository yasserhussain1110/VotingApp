const express = require('express');
const app = express();
const mongo = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const validator = require('./validators/validator');
const bodyParser = require('body-parser');
const _ = require('lodash');
const merge = require('merge');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');

var dbUrl = process.env.DATABASE_URL || "mongodb://localhost:27017/voto";

app.set('view engine', 'jade');

app.use(express.static('public'));

app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['some-secret'],
  // Cookie Options
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
}));

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.get('/', function (req, res) {
  res.redirect('/home');
});

app.get('/home', function (req, res) {
  res.render('home');
});

app.get('/polls', function (req, res) {
  mongo.connect(dbUrl, function (err, db) {
    const polls = db.collection("polls");
    polls.find({}, {question: 1}).toArray(function (err, polls) {
      res.render('polls', {polls: polls});
      db.close();
    });
  });
});

app.get('/poll/:id([0-9a-fA-F]{24})', function (req, res) {
  var pollObjectId = req.params.id;
  mongo.connect(dbUrl, function (err, db) {
    const polls = db.collection("polls");
    polls.find({_id: ObjectID(pollObjectId)}, {_id: 0, question: 1, answers: 1}).toArray(function (err, polls) {
      if (polls.length == 0) {
        res.status(404).send("Could not find poll");
      } else {
        var poll = polls[0];
        res.render('poll', {question: poll.question, answerString: JSON.stringify(poll.answers)});
      }
      db.close();
    });
  });
});

app.get('/signup', function (req, res) {
  if (req.session.user) {
    res.redirect('/home');
  } else {
    res.render('signup');
  }

});

app.post('/signup', function (req, res) {
  if (req.session.user) {
    res.redirect('/home');
    return;
  }

  var tentativeUser = {};
  tentativeUser.email = req.body.email;
  tentativeUser.password = req.body.password;

  var result = validator.validateSignUpForm(tentativeUser);

  if (_.isEmpty(result)) {

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
    res.render('signup', merge(tentativeUser, result));
  }
});

function createNewUser(user, onCreationSuccessful, onUserExists, onOtherError) {
  mongo.connect(dbUrl, function (err, db) {
    const usersCollection = db.collection("users");
    usersCollection.insert({email: user.email, password: user.password}, function (err, data) {
      if (err && err.code === 11000) {
        onUserExists();
      }

      if (!err) {
        onCreationSuccessful(data.ops[0]);
      } else {
        console.log("Weird Situation");
        onOtherError();
      }

      db.close();
    });
  });
}

app.get('/login', function (req, res) {
  if (req.session.user) {
    res.redirect('/home');
  } else {
    res.render('login');
  }
});

app.post('/login', function (req, res) {
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
});


function authenticateUser(loginParams, onAuthSuccess, onAuthFailure) {
  if (!loginParams.email || !loginParams.password) {
    authFailure();
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


app.listen(process.env.port || 8080);
// db.users.createIndex( { email: 1 }, { unique: true } )
