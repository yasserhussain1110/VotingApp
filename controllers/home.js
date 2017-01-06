module.exports = {
  get: function (req, res) {
    var templateParams = {};
    if(req.session && req.session.user) {
      templateParams.user = req.session.user;
    }
    res.render('home', templateParams);
  }
};
