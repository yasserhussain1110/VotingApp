var express = require('express');
var app = express();

app.set('view engine', 'jade');
app.use(express.static('public'));

app.get('/', function(req, res){
  res.redirect('/index');
});

app.get('/index', function (req, res) {
  res.render('index', {})
});

app.get('/polls', function (req, res) {
  res.render('polls', {})
});

app.get('/poll', function (req, res) {
  res.render('poll', {})
});



app.listen(process.env.port || 8080);
