'use strict';

var express        = require('express')
  , passport       = require('passport')
  , OpenIDStrategy = require('passport-openid').Strategy
  , _              = require('lodash')
  , app            = express()
  , host           = process.env.HOST
  , port           = process.env.PORT || 3000
;

app.use(express.static('public'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'no peeking' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);


// Passport configuration

var origin = 'http://'+ host +':'+ port;

passport.use(new OpenIDStrategy({
    returnURL: origin + '/auth/openid/return',
    realm:     origin + '/'
}, function(identifier, done) {
    findUser(identifier, done);
}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    var user = _.find(users, { id: id });
    if (user) {
        done(null, user);
    }
    else {
        done(new Error('no such user'));
    }
});


// Passport authentication endpoints

app.post('/auth/openid', passport.authenticate('openid'));

app.get('/auth/openid/return', passport.authenticate('openid', {
    successRedirect: '/',
    failureRedirect: '/login.html'
}));

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});


// My application endpoints

app.get('/', function(req, res) {
    var body = 'Hello, world!';
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Length', body.length);
    res.end(body);
});

app.get('/whoami', function(req, res) {
    var user = req.user
      , tmpl = '<h1><%= openid %></h1><p>member since <%= since %></p>';
    if (user) {
        res.setHeader('Content-Type', 'text/html');
        res.end(_.template(tmpl, user));
    }
    else {
        res.redirect('/login.html');
    }
});

app.listen(port);
console.log('Listening on port 3000');
console.log('Realm is: '+ origin);


// Fancy in-memory database

var users = [], lastId = 0;

function findUser(identifier, callback) {
    var user = _.find(users, { openid: identifier });
    if (!user) {
        // new user!
        user = {
            openid: identifier,
            since: new Date(),
            id: ++lastId
        };
        users.push(user);
    }
    callback(null, user);
}
