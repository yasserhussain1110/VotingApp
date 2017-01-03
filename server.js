var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var dbUrl = process.env.DATABASE_URL || "mongodb://localhost:27017/voto";

app.set('view engine', 'jade');
app.use(express.static('public'));

app.get('/', function(req, res){
  res.redirect('/index');
});

app.get('/index', function(req, res){
  res.render('index', {});
});

app.get('/polls', function (req, res) {
  mongo.connect(dbUrl, function(err, db) {
    const polls = db.collection("polls");
    polls.find({}, {question:1}).toArray(function(err, polls){
      res.render('polls', {polls: polls});
      db.close();
    });
  });
});

app.get('/poll/:id([0-9a-fA-F]{24})', function (req, res) {
  var pollObjectId = req.params.id;
  mongo.connect(dbUrl, function(err, db) {
      const polls = db.collection("polls");
      polls.find({_id: ObjectID(pollObjectId)}, {_id:0, question:1, answers:1}).toArray(function(err, polls){
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


app.listen(process.env.port || 8080);
