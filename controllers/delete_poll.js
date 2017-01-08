const conf = require('../services/conf');
const validator = require('../validators/validator');
const _ = require('lodash');
const mongo = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

var dbUrl = conf.dbUrl;

module.exports = {
  post: function (req, res) {
    if (!req.session.user) {
      res.redirect('/login');
      return;
    }
    var reqParams = req.body;
    var validationErrors = validator.validateDeletePollForm(reqParams);
    if (_.isEmpty(validationErrors)) {
      var onDeleteDone = function () {
        res.redirect('/mypolls');
      };
      removePollFromDB(reqParams.pollId, onDeleteDone);
    } else {
      res.status(400).send(validationErrors.deleteError);
    }
  }
};

function removePollFromDB(pollId, onDeleteDone) {
  mongo.connect(dbUrl, function (err, db) {
    const pollsCollection = db.collection("polls");
    pollsCollection.remove({
      _id: ObjectId(pollId)
    });
    db.close();
    onDeleteDone();
  });
}
