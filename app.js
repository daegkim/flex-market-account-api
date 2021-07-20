var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var path = require('path');
var createError = require('http-errors');

var accountRouter = require('./routes/account');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', accountRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

//서버 실행과 동시에 mongodb 접속
mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost:27017/flex", { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {console.log("mongo connected");})
.catch((reason) => {console.log(reason);});

module.exports = app;
