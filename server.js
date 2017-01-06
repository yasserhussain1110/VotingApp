const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');


const pollController = require('./controllers/poll');
const newPollController = require('./controllers/new_poll');
const listPollsController = require('./controllers/list_polls');
const signupController = require('./controllers/signup');
const loginController = require('./controllers/login');
const homeController = require('./controllers/home');
const logoutController = require('./controllers/logout');
const myPollsController = require('./controllers/my_polls');

const conf = require('./services/conf');

var dbUrl = conf.dbUrl;

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

app.get('/home', homeController.get);

app.get('/polls', listPollsController.get);

app.get('/poll/:id([0-9a-fA-F]{24})', pollController.get);

app.post('/poll/:id([0-9a-fA-F]{24})', pollController.post);

app.get('/signup', signupController.get);

app.post('/signup', signupController.post);

app.get('/login', loginController.get);

app.post('/login', loginController.post);

app.get('/newpoll', newPollController.get);

app.post('/newpoll', newPollController.post);

app.get('/logout', logoutController.get);

app.get('/mypolls', myPollsController.get);

app.listen(process.env.port || 8080);
// db.users.createIndex( { email: 1 }, { unique: true } )
