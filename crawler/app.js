/**
 * Module dependencies.
 */

var appInit = require('./appinit.js');
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var Database = require('./persistence/database');
var fileStore = require('./persistence/fileStore');
var byr_board_friends = require('./services/byr.board.friends');
var eventq = require('./services/eventq');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

// Log an event that we have started.
appInit.appPromise.onResolve(function(err) {
    if (err) {
        console.error(err);
    } else {
    	console.log('appInit.appPromise.onResolve.')
    }
});

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
    console.log('App are running now.');
});

appInit.resolve();
