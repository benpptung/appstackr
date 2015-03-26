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
var Stream = require('stream'),
    Readable = Stream.Readable;

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

  var that = this;
  var res = [];
  var codes_is_stream;

  /// check modulename
  if (!this.modulename || modules.indexOf(this.modulename) < 0) {
    this.emit('error', new RangeError(format('Invalid module name or non exist: %s', this.modulename)));
    return;
  }

  /// check codes
  if (isReadable(codes)) codes_is_stream = true;
  if (!codes_is_stream && !isCodes(codes)) {
    this.emit('error', new RangeError(format('codes should be Readable stream, buffer or string, but got %s', inspect(codes, {colors: true}))));
    return;
  }

  var cp = fork(join(__dirname, this.modulename), {silent: true});

  /// configure the cp
  cp.send(this.config);

  /// listen to log/warn messages & start writing when config recieved message arrived.
  cp.on('message', function(message) {

    if (message == 'config recieved') {

      debug('child %d'.blue + ' config recieved', cp.pid);
      /// send data to cp
      codes_is_stream ? codes.pipe(cp.stdin) : cp.stdin.end(codes);
      return;
    }

    that.emit('message', message);
  });

  /// listen to cp error
  cp.on('error', function(error) {
    that.emit('error', error);
  });

  cp.stderr.on('data', function(chunk) {
    that.emit('error', chunk.toString());
  });

  /// LISTEN to "close" to ensure we got all data back from the child process
  cp.on('close', function(code, signal) {

    if ( code == 0) {
      if (typeof callback == 'function') callback(null, Buffer.concat(res));
      return;
    }
    /// handle error
    var err = new Error(format('child process %s exit with error code %s and signal %s', that.modulename, code, signal));
    typeof callback == 'function' ? callback(err) : that.emit('error', err);
  });

  /// return stream if no callback
  if (typeof callback != 'function') {
    return cp.stdout;
  }
  else {
    cp.stdout.on('data', function(chunk) {
      res.push(chunk);
    })
  }
};


var isReadable = function(stream) {
  return stream instanceof Readable || stream instanceof Stream;
};

var isCodes = function(codes) {
  return typeof codes == 'string' || Buffer.isBuffer(codes);
};