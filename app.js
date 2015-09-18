var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var rhythms = require('./routes/rhythms');
var buttonEvents = require('./routes/button-events');

var nconf = require('nconf');
nconf.env()
.file({ file: 'config.json', search: true });
var authUser = nconf.get("RHYTHM_AUTH_USER");
var authPassword = nconf.get("RHYTHM_AUTH_PASSWORD");
var basicAuth = require('basic-auth-connect');

var app = express();
var expressValidator = require('express-validator');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(basicAuth(authUser, authPassword));

app.use('/', index);
app.use('/rhythms', rhythms);
app.use('/button-events', buttonEvents);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var Journaler = require('./service/git-hub-service.js');
var journaler = new Journaler();
journaler.addJournalEntry();

module.exports = app;
