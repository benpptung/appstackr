/**
 * User: benpptung
 * Date: 2014/1/29
 * Time: PM10:36
 */


/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    swig = require('swig');

/**
 * Instances
 */
var ctrl = require('./ctrl'),
    app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.engine('html', swig.renderFile);
app.set('views', path.join(__dirname, app.get('env') == 'production' ? 'dist/views' : 'views' ));
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
// to make browser to visit this server for public, you need to set the local DNS server to your test server
app.use(express.static(path.join(__dirname, app.get('env') == 'production' ? 'dist/public': 'public')));

console.log(app.get('env'));
console.log(app.get('views'));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  swig.setDefaults({cache: false});
}

app.get('/', ctrl.index());
app.get('/bs', ctrl.bs());

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});