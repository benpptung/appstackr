/**
 * User: benpptung
 * Date: 2014/2/2
 * Time: PM7:51
 */

    // modules required
var fs = require('fs');
var path = require('path'),
    resolve = path.resolve,
    basename = path.basename;
var util = require('util'),
    format = util.format;
var spawn = require('child_process').spawn;
var Stream = require('stream'),
    Readable = Stream.Readable;


var async = require('async');
var browserify = require('browserify');
//var uglify = require('uglify-js');
var less = require('less');
var sass = require('node-sass');
var stylus = require('stylus');
var autoprefixer = require('autoprefixer-core');
//var CleanCSS = require('clean-css');
//var prettyjson = require('prettyjson');
var glob = require('glob');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var colors = require('colors');
var debug = require('debug')('appstackr:utils');

var config = require('./globals').config,
    META = config.META;
var jar_ext_path = path.resolve(__dirname, '..', 'ext', 'htmlcompressor-1.5.3.jar');
var childs = require('./childs');



/**
 * Local exports - utilities
 */

/*exports.error = function(err){
  var args;
  if (typeof err == 'string') {
    args = Array.prototype.slice.call(arguments, 0);
    err = format.apply(null, args);
  }

  if (!(err instanceof Error)) err = { name : 'UnregulatedError', message: err.toString('utf8')};
  console.error(prettyjson.render(err));
};

exports.log = function(message){
  var args;
  if (typeof message == 'string') {
    args = Array.prototype.slice.call(arguments, 0);
    message = { message: format.apply(null, args) };
  }
  console.log(prettyjson.render(message));
};*/

var oldtime;

/**
 * Prepare to replace exports.error
 * @param message
 */
exports.warn = function() {
  var args = Array.prototype.slice.call(arguments, 0);
  var message = format.apply(null, args);
  var diff, now = new Date();

  if (!oldtime) {
    oldtime = now;
    /// we can disable console via config if it is needed in the future
    console.error('[' + META.name.magenta + '] ' + message);
  }
  else {
    diff = now - oldtime;
    oldtime = now;
    console.error('[' + META.name.magenta + '] ' + message + ' '+ pretty_ms(diff));
  }

};

/**
 * Prepare to replace exports.log
 * @param message
 */
exports.message = function() {
  var args = Array.prototype.slice.call(arguments, 0);
  var message = format.apply(null, args);
  var diff, now = new Date();

  if (!oldtime) {
    oldtime = now;
    /// we can disable console via config if it is needed in the future
    console.log('[' + META.name.cyan + '] ' + message);
  }
  else {
    diff = now - oldtime;
    oldtime = now;
    console.log('[' + META.name.cyan + '] ' + message + ' '+ pretty_ms(diff));
  }

};

exports.clean = function(command, callback){
  // variables declare
  var folders = [], eraser;
  if (typeof command == 'function'){
    callback = command;
    command = 'build';
  }
  command = (command && typeof command == 'string' && command == 'stack') ? 'stack' : 'build';
  callback = typeof callback == 'function' ? callback : function(){};

  // set folders to clean
  switch (command){
    case 'stack':
      folders.push(config.js, config.css, config.snippet, config.src);
      break;
    case 'build':
      folders.push(config.distPublic, config.distViews);
      break;
  }
  // compose our own eraser
  eraser = async.compose( async.each.partial(undefined, rimraf, undefined) , glob, dirfiles);
  // looping the folders to empty
  if (config.warning) exports.log('Start looping to clean folers:\n    - ' + folders.join('\n    - '));
  async.each(folders, eraser, callback);

  // build the path to ensure we only empty the files under the directory
  function dirfiles(dir_path, done){
     done(null, path.join(dir_path, '*'));
  }
};

/**
 * This is a wrapper to make mkdirp callback signature consistent, because
 * mkdirp callback signature is unconsistent if new made directory happen
 * @param {string} p - path to mkdirp
 * @param callback
 */
exports.mkdirp = function(p, callback){
  mkdirp(p, function(err, done){
    if (err) return callback(err);
    callback(null);
  });
};

/**
 *
 * @param {Array} arr
 * @param {String} [flags]
 * @returns {RegExp|Object}
 */
exports.extnameReg = function (arr, flags){
  var pattern;
  flags = flags || '';

  if (arr.length == 0 || !Array.isArray(arr)) {
    return {
      test: function(){ return false}
    };
  }
  arr = arr.map(function(ext_name){
    return RegExp.quote(ext_name.toString());
  });
  pattern = '(' + arr.join('|') + ')$';
  return new RegExp(pattern, flags);
};


// exports - loader

/**
 * webmake wrapper
 * @param files
 * @param callback
 */
/*exports.webmake = function(files, callback){
  async.mapSeries(files, runner, function(err, res){
    if (err) return callback(err);
    callback(null, res.join('\n'));
  });

  function runner(file, done){
    webmake(file, done);
  }
};*/

exports.browserify = function(files, options, callback){

  var options_not_allowed = config.browserifyNotAllowed;
  var bundle, exposes, externals, ignores;
  var i, len; // looping variables

  if (arguments.length < 3) {
    callback = typeof options == 'function' && options;
    options = false;
  }
  callback = typeof callback == 'function' ? callback : function(){};

  if (options === true) options = config.browserify; /// use appstackr_settings.json and config.js
  options = options && typeof options == 'object' ? options : {};

  exposes = options.exposes;
  externals = options.externals;
  ignores = options.ignores;

  for(i = 0, len = options_not_allowed.length; i < len; i++ ) {
    /// delete un-wanted option if it is more user friendly.
    delete options[options_not_allowed[i]];
  }

  bundle = browserify(options);

  /// all files should be required
  if (exposes === true || ( typeof exposes == 'string' && ~['*', 'all'].indexOf(exposes.toLowerCase()) < 0 )) {
    for(i = 0, len = files.length; i < len; i++) {
      bundle.require( files[0], {expose: basename(files[0])});
    }
    files = []; // all the files are required.
  }

  /// convert string to array -- exposes, externals and ignores
  if (typeof exposes == 'string' && files.length > 0) {
    // if exposes == *, all or ALL, files.length will be zero
    exposes = exposes.replace(/\s/g, '').split(',');
  }

  if (typeof externals == 'string') externals = externals.replace(/\s/g, '').split(',');
  if (typeof ignores == 'string') ignores = ignores.replace(/\s/g, '').split(',');


  /// require file by name:target
  if (Array.isArray(exposes)) {
    exposes.forEach(function(expose) {
      var names = expose.split(':');
      var name = names[0];
      var target = names[1] || name;
      var i, len, filename, require_identifier;

      for(i = 0, len = files.length; i < len; i++) {
        filename = basename(files[i]);

        // file found for expose
        if (filename == name) {
          // detect if it is a module
          require_identifier = filename == files[i] ? name : resolve(files[i]);

          bundle.require( require_identifier, {expose: target});
          files.splice(i, 0);
          break;
        }
      }
    });
  }

  // add the files left to browserify
  for(i = 0, len = files.length; i < len; i++) {
    bundle.add(files[i]);
  }

  if (Array.isArray(externals)) {
    for(i = 0, len = externals.length; i < len; i++) {
      if (typeof externals[i] == 'string') {
        bundle.external(externals[i]);
      }
    }
  }

  if (Array.isArray(ignores)) {
    for(i = 0, len = ignores.length; i < len; i++) {
      if (typeof ignores[i] == 'string') {
        bundle.ignore(ignores[i]);
      }
    }
  }

  callback(null, bundle.bundle());
  //bundle.bundle(callback);
};

exports.css = function(files, browsers, callback){

  if (arguments.length == 2) {
    callback = typeof browsers == 'function' ? browsers : function(){};
    browsers = false;
  }

  async.mapSeries(files, function(file, done){

    // read the file indicated in the files array, and convert them onto codes
    var paths = [path.dirname(file)], filename = path.basename(file);
    fs.readFile(file, 'utf8', function(err, content){

      var extname = path.extname(file);
      switch (extname){
        case '.less':
          less.render(
            content,
            {paths: paths, filename: filename},
            function(err, res){
              if (err) return done(err);
              done(null, res.css);
            });
          return;

        case '.scss':
          return exports.sassRender(content, paths, done);

        case '.styl':
          stylus(content)
            .set('filename', filename)
            .set('paths', [paths])
            .render(done);
          return;

        default:
          return done(null, content);
      }
      // maybe we can add .styl ....but let us stick on less & sass now

    })
  }, function(err, res){
    if (err) return callback(err);

    var codes = res.join('\n');
    if (browsers === true) browsers = config.autoprefixer;
    if (typeof browsers == 'string' || Array.isArray(browsers)) {
      codes = autoprefixer({browsers: browsers, cascade: config.beautify}).process(codes).css;
    }

    //return callback(null, res.join('\n'));
    return callback(null, codes);
  });
};

/**
 * @param {Array} files
 * @param {function} callback
 */
exports.concat = function(files, callback){
      async.mapSeries(files, fs.readFile.partial(undefined, 'utf8', undefined), function(err, res){
        if (err) return callback(err);
        callback(null, res.join('\n'));
  });
};

// exports - Minifiers

exports.uglify = function(codes, callback) {

  exports.useChilds('uglifyjs.js', codes, callback);

  /*childs
    .options({
      modulename: 'uglifyjs.js',
      config: config
    })
    .on('error', function(error) {
      exports.warn(error);
    })
    .on('message', function(message) {
      if (config.warning) exports.message(message);
    })
    .run(codes, callback)*/
};

exports.cleanCSS = function(codes, callback){

  exports.useChilds('clean-css.js', codes, callback);

  /*childs
    .options({
      modulename: 'clean-css.js',
      config: config
    })
    .on('error', function(error) {
      exports.warn(error);
    })
    .on('message', function(message) {
      if (config.warning) exports.message(message);
    })
    .run(codes, callback);*/
};

exports.useChilds = function(module_name, codes, callback) {

  childs({
    modulename: module_name,
    config: config
  })
    .on('error', function(error) {
      exports.warn(error);
    })
    .on('message', function(message) {
      if (config.warning) exports.message(message);
    })
    .run(codes, callback);

};

/**
 * @param {string} codes
 * @param {function} callback
 */
/*exports.uglify = function(codes, callback){

  if (Buffer.isBuffer(codes)) codes = codes.toString('utf8');

  /// mock util.error to control the message sent by UglifyJS2
  // if we fork a process to handle js compression in the future, we can mock that warning in the child process
  var utilerror = util.error;
  util.error = util_error_uglifymock;

  var res = uglify.minify(codes, {
    warnings: config.warning,
    fromString: true,
    mangle: {except: config.reserved },
    output: { beautify: config.beautify},
    compress: { warnings:config.warning, unsafe: true}
  });

  /// revert util.error
  util.error = utilerror;

  callback(null, res.code);
};

var util_error_uglifymock = function(message) {

  if (config.warning) {
    exports.message('UglifyJS2'.yellow + ' ' + message);
  }
};*/

/**
 *
 * @param codes
 * @param callback
 */
/*exports.cleanCSS = function(codes, callback){
  if (profile.beautify) return callback(null, codes);
  var minified = (new CleanCSS({
    keepSpecialComments: 0,
    processImport: false,
    noRebase: true
  })).minify(codes);
  callback(null, minified);
};*/

/**
 * cleanCSS based on clean-css npm 3.0.10
 * @param codes
 * @param callback
 * @returns {*}
 *//*
exports.cleanCSS = function(codes, callback){
  if (config.beautify) return callback(null, codes);

  var minified = (new CleanCSS({
    keepSpecialComments: 0,
    processImport: false,
    rebase: true
  })).minify(codes).styles;
  callback(null, minified);
};*/

/**
 *
 * @param codes
 * @param callback
 */
/*exports.ycssmin = function(codes, callback){
  if (profile.beautify) return callback(null, codes);
  var minified = ycssmin(codes);
  callback(null, minified);
};*/

/**
 *
 * @param {string} codes
 * @param {function} callback - ({Error}, {Buffer})
 */
exports.htmlcompressor = function(codes, callback){
  var compressor,
      java_options = [],
      result_buffs = [],
      error_buffs = [];

  java_options.push('-jar', jar_ext_path, '--remove-intertag-spaces');
  if (config.viewCSSMini) java_options.push('--compress-css');
  if (config.viewJsMini) java_options.push('--compress-js');

  compressor = spawn('java', java_options);
  compressor.stdout.on('data', function(chunk){
    result_buffs.push(chunk);
  });
  compressor.stderr.on('data', function(chunk){
    error_buffs.push(chunk);
  });
  compressor.on('close', function(code){
    if (code != 0) return callback(new SyntaxError(Buffer.concat(error_buffs).toString()));
    callback(null, Buffer.concat(result_buffs) );
  });
  compressor.stdin.end(codes);
};

/**
 *
 * @param {String} content
 * @param {Array} includes
 * @param {Function} callback
 */
exports.sassRender = function(content, includes, callback){

  /*sass.render({
    data: content,
    includePaths: includes,
    success: async.apply(callback, null),
    error: callback
  })*/

  sass.render({
    data: content,
    includePaths: includes,
    error: callback,
    success: function(res){
      callback(null, res.css);
    }
  })
};

/**
 *
 * @param {*} stream
 * @returns {boolean}
 */
exports.isReadable = function(stream) {
  return stream instanceof Readable || stream instanceof Stream;
};

var pretty_ms = function(ms) {

  if (ms < 1000) return (ms + 'ms').green;
  return (( Math.round( ms / 100) / 10 ) + 's' ).green;
};