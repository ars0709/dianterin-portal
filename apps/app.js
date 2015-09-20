var express         = require('express');
var path            = require('path');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var passport        = require('passport');
var methodOverride  = require('method-override');
var libs            = process.cwd() + '/apps/';
require(libs + 'auth/auth');

var config          = require('./config');
var log             = require('./log')(module);
var oauth2          = require('./auth/oauth2');
var api             = require('./routes/api');
var users           = require('./routes/users');
var app             = express();

app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, *');

    //res.removeHeader("X-Powered-By");
    res.setHeader( 'X-Powered-By', 'Dianterin App v0.0.1' );

    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride());
app.use(passport.initialize());


app.use('/', api);
app.use('/api', api);
app.use('/api/users', users);
app.use('/api/oauth2/token', oauth2.token);

// catch 404 and forward to error handler
app.use(function(req, res, next){
    res.status(404);
    log.debug('%s %d %s', req.method, res.statusCode, req.url);
    res.json({
        valid: false,
    	error: '404 Not found'
    });
    return;
});

// error handlers
app.use(function(err, req, res, next){
    res.status(err.status || 500);
    log.error('%s %d %s', req.method, res.statusCode, err.message);
    res.json({
        valid: false,
    	error: err.message
    });
    return;
});

module.exports = app;