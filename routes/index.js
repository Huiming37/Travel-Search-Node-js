var express = require('express');
var router = express.Router();
var passport = require("passport");
var User = require("../Models/user.js");
const bodyParser = require("body-parser");


router.get('/', function (req, res) {
    res.render("index");
});

router.get('/register', function (req, res) {
    res.render("register");
});


var map = new Map();

router.post("/register", function (req, res){
    User.register(new User({username: req.body.username, favourites: map, firstname: req.body.firstname,
                    lastname: req.body.lastname, email: req.body.email
    }), req.body.password, function (err, user) {
        if(err){
            req.flash("error", err.message);
            console.log(err.message);
            return res.redirect("/register");
            // return res.render("register");
        }
        passport.authenticate("local")(req,res,function () {
            res.redirect("/searching");
        })

    })
});


router.get("/login", function (req, res) {
    res.render("login");
});


router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) { return next(err); }
        if (!user) {
            req.flash("error", "Invalid username or password");
            return res.redirect('/login');
        }
        req.logIn(user, err => {
            res.redirect("/searching");
        });
    })(req, res, next);
});

router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

router.get("/searching", function (req, res) {
    res.render("searchingPage",{currentUser : req.user});
});


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;
