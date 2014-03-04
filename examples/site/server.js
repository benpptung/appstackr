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
    todolist = require('./ctrl/todolist')
    app = express();

swig.setDefaults({cache: false}); // to ensure NEVER cache view for demo

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

console.log('environment:', app.get('env'));
console.log('views:', app.get('views'));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// start of ctrls
app.get('/', ctrl.homepage());
app.get('/bs/', ctrl.bs());
app.get('/vacation-note/', ctrl.vacationNote());

app.get('/TodoMVC/', todolist.todoMVC());
app.get('/todolist', todolist.list());
app.post('/todolist', todolist.update());

// end of ctrls

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});