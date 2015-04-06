'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util'),
    inspect = util.inspect,
    format = util.format,
    inherits = util.inherits;
var path = require('path'),
    basename = path.basename,
    join = path.join;
var fork = require('child_process').fork;

var colors = require('colors');
var debug = require('debug')('appstackr:childs');

var excludes = ['child-utils.js', 'index.js'];
var modules = require('glob').sync(join(__dirname, '*.js'))
                .map(function(file) {
                  return basename(file);
                })
                .filter(function(name) {
                  return excludes.indexOf(name) < 0;
                });


module.exports = childs;

/**
 * @param {object} options
 * @returns {Childs}
 */
function childs(options) {
  return new Childs(options);
}

childs.options = childs;

/**
 * @param {object} options
 * @constructor
 */
function Childs(options) {

  EventEmitter.call(this);

  options = options && typeof options == 'object' ? options : {};

  this.modulename = options.modulename;
  this.config = options.config;

  if (!/\.js$/i.test(this.modulename)) this.modulename = this.modulename + '.js';
}

inherits(Childs, EventEmitter);

/**
 *
 * @param {Stream|Readable|Buffer|String} codes
 * @param {Function} [callback]
 * @returns {ChildProcess.stdout|undefined}
 */
Childs.prototype.run = function(codes, callback) {

  if (typeof callback != 'function') {
    throw new TypeError(format('callback is needed but got %s', inspect(callback, {colors: true})));
  }

  /// check modulename
  if (!this.modulename || modules.indexOf(this.modulename) < 0) {
    return callback(new RangeError(format('Invalid module name or non exist: ' + '%s'.magenta , this.modulename)));
  }

  /// check codes
  if (!isCodes(codes)) {
    return callback(new RangeError(format('codes should be buffer or string, but got %s', inspect(codes, {colors: true}))));
  }

  var that = this;
  var res = [];
  var called = false;
  var error;
  var cp = fork(join(__dirname, this.modulename), {silent: true});

  /// configure the cp
  cp.send(this.config);

  /// listen to log/warn messages & start writing when config recieved message arrived.
  cp.on('message', function(message) {

    if (message == 'config recieved') {

      debug('child %d'.blue + ' config recieved', cp.pid);
      /// send data to cp
      return cp.stdin.end(codes);
    }

    if (typeof message.message == 'string') {
      // message with message property should be an Error Object
      return error = message;
    }
    // allow child process to write something back, e.g. UglifyJS will have a lot of warn messages delivered here
    that.emit('message', message);
  });

  cp.on('error', function(error) {
    if (!called) return cb(error);
    // impossible situation, but if it does happen we emit it to warn
    that.emit('error', error);
  });

  cp.stderr.on('data', function(chunk) {
    // child process can write stderr to warn something which is more imporant than normal message
    that.emit('error', chunk.toString());
  });

  /// LISTEN to "close" to ensure we got all data back from the child process
  cp.on('close', function(code, signal) {

    if ( code != 0) {

      if (!error) error = new Error(format('child process %s about %s exit with error code %s and signal %s', cp.pid, that.modulename, code, signal));
      if (called) {
        // impossible situation, but if it does happen we emit it for caller to warn
        that.emit('error', error );
        return;
      }
      return cb(error);
    }

    if (called) {
      // impossible situation, but if it does happen we emit error to warn
      that.emit('error', new Error(format('child process %s about %s exit with code 0, but callback is called', cp.pid, that.modulename)));
      return;
    }
    cb(null, Buffer.concat(res));
  });

  /// return stream if no callback
  cp.stdout.on('data', function(chunk) {
    res.push(chunk);
  });

  function cb(err, res) {
    called = true;
    callback(err, res);
  }
};

var isCodes = function(codes) {
  return typeof codes == 'string' || Buffer.isBuffer(codes);
};