const conf = require('../services/conf');
const mongo = require('mongodb').MongoClient;

var dbUrl = conf.dbUrl;

module.exports = {
  get: function (req, res) {
    mongo.connect(dbUrl, function (err, db) {
      const polls = db.collection("polls");
      polls.find({}, {question: 1}).toArray(function (err, polls) {
        res.render('polls', {
          polls: polls,
          user: req.session.user
        });
        db.close();
      });
    });
  }
};
