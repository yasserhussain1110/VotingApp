const conf = require('../services/conf');
const mongo = require('mongodb').MongoClient;

var dbUrl = conf.dbUrl;

module.exports = {
  get: function (req, res) {
    if (!req.session.user) {
      res.redirect('/login');
      return;
    }

    var userId = req.session.user._id;

    mongo.connect(dbUrl, function (err, db) {
      const polls = db.collection("polls");
      polls.find({createdBy: userId}, {question: 1}).toArray(function (err, polls) {
        res.render('my_polls', {
          polls: polls,
          user: req.session.user
        });
        db.close();
      });
    });
  }
};
