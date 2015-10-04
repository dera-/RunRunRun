var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;

//Twitter Appsにて取得したConsumer Key (API Key)とConsumer Secret (API Secret)を記述
var TWITTER_CONSUMER_KEY = "bWtWCv1fsQKzhMW43syw4mQUS";
var TWITTER_CONSUMER_SECRET = "k9P6MePFGC1978jlKOz02XhfdQ5OU69QtQycXdYuFkBcEHrYhH";

var routes = require('./routes/index');
var users = require('./routes/users');
// var oauth = require('./routes/oauth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(express.static('public'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

passport.use(
  new TwitterStrategy(
    {
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_CONSUMER_SECRET,
      callbackURL: "http://127.0.0.1:3000/oauth/callback" //Twitterログイン後、遷移するURL
    },
    function (token, tokenSecret, profile, done) {
      passport.session.accessToken = token;
      console.log(token, tokenSecret, profile);
      process.nextTick(
        function () {
          done(null, profile);
        }
      );
    }
  )
);

passport.serializeUser(function(user, done){
  done(null, user);
});

passport.deserializeUser(function(obj, done){
  done(null, obj);
});

app.use('/', routes);
app.use('/users', users);

// 認証のために Twitter へリダイレクトさせます。認証が完了すると、Twitter は
// ユーザーをアプリケーションへとリダイレクトして戻します。
//   /auth/twitter/callback
app.get('/oauth', passport.authenticate('twitter'));

// ユーザーが許可すると、Twitter はユーザーをこの URL にリダイレクトさせます。
// この認証プロセスの最後に、アクセストークンの取得をおこないます。
// この取得が成功すればユーザーはログインしたことになります。取得に失敗したとき
// は、認証が失敗したとみなされます。
app.get('/oauth/callback',
  passport.authenticate('twitter', { successRedirect: '/',
                                     failureRedirect: '/login' }));

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


var server = app.listen(3000,function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

module.exports = app;