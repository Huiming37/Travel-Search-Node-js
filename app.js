var createError = require('http-errors');

var express                = require('express'),
    mongoose               = require('mongoose'),
    passport               = require("passport"),
    LocalStrategy          = require("passport-local"),
    passportLocalMongoose  = require("passport-local-mongoose"),
    flash                  = require("connect-flash"),
    bodyParser             = require("body-parser"),
    User                   = require("./Models/user.js");

mongoose.connect("mongodb://doudou:12345dou@ds241133.mlab.com:41133/place_search", { useNewUrlParser: true });


var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(bodyParser.urlencoded({extended: true}));

app.use(require("express-session")({
    secret: "I like running",
    resave: false,
    saveUninitialized: false
}));


app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    next();
});


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/detail');


app.use('/', indexRouter);
app.use('/detail', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;

