require('dotenv').config();

var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'sflkjwlflsfljsdfPLjWefsdlfjWafd$%#%#',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(function(req,res,next){
  res.locals.session = req.session;
  next();
});


var auth = function (req, res, next) {
  if (!req.session.fullname) {
    req.session.hn = req.query.hn;
    console.log(req.session.hn);
    res.redirect('/users/login');
  } else {
    req.session.hn = req.query.hn || req.body.hn;
    console.log(req.session.hn);
    next();
  }
}

var configHos = {
  host: process.env.HOSXP_HOST,
  port: +process.env.HOSXP_PORT,
  database: process.env.HOSXP_DB,
  user: process.env.HOSXP_USER,
  password: process.env.HOSXP_PASSWORD,
}

var configEmr = {
  host: process.env.EMR_HOST,
  port: +process.env.EMR_PORT,
  database: process.env.EMR_DB,
  user: process.env.EMR_USER,
  password: process.env.EMR_PASSWORD,
}

app.use(function (req, res, next) {

  req.imagePath = process.env.IMAGE_PATH;

  req.dbHOS = require('knex')({
    client: 'mysql',
    connection: configHos,
    pool: {
      min: 0,
      max: 7,
      afterCreate: (conn, done) => {
        conn.query('SET NAMES utf8', (err) => {
          done(err, conn);
        });
      }
    },
    debug: true,
    acquireConnectionTimeout: 5000
  });

  req.dbEmr = require('knex')({
    client: 'mysql',
    connection: configEmr,
    pool: {
      min: 0,
      max: 7,
      afterCreate: (conn, done) => {
        conn.query('SET NAMES utf8', (err) => {
          done(err, conn);
        });
      }
    },
    debug: true,
    acquireConnectionTimeout: 5000
  });
  next();
});

app.use('/users', users);
app.use('/', auth, index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err);
  res.send({ ok: false, error: err });
});

module.exports = app;
