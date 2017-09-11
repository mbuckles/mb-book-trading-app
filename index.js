var express = require('express');
var assert = require('assert');
const mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
const passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const LocalStrategy = require('passport-local').Strategy;
const User = require('./app/models/user').User;
const session = require('express-session');
const bcrypt = require('bcrypt');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
var app = express();
var path = require('path');
const cookieParser = require('cookie-parser');
var configDB = require('./config/database.js');

//var mongodb = 'mongodb://mbuckles:adjf1963@ds143132.mlab.com:43132/google-book-app';
mongoose.connect(configDB.url);
mongoose.connection.on('connected', function() {
  console.log('Mongodb connected to ' + configDB.url);
});

//app.use(logger('dev'));
app.use(morgan('dev'));
app.use(cookieParser());

app.use(session({
  secret: 'keyboard cat',
  saveUninitialized: true,
  resave: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//app.use(express.static(__dirname + '/public'));
// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

require('./app/routes.js')(app, passport);
require('./config/passport')(passport);

app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
