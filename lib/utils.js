/**
 * User: benpptung
 * Date: 2014/2/2
 * Time: PM7:51
 */

    // modules required
var fs = require('fs');
var path = require('path'),
    sep = path.sep,
    resolve = path.resolve,
    basename = path.basename;
var util = require('util'),
    inspect = util.inspect,
    format = util.format;
var spawn = require('child_process').spawn;
var Stream = require('stream'),
    Readable = Stream.Readable;


var async = require('async');
var browserify = require('browserify');
var less = require('less');
var sass = require('node-sass');
var stylus = require('stylus');
var autoprefixer = require('autoprefixer-core');
var glob = require('glob');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var colors = require('colors');
var debug = require('debug')('appstackr:utils');

var config = require('./globals').config,
    META = config.META;
var jar_ext_path = path.resolve(__dirname, '..', 'ext', 'htmlcompressor-1.5.3.jar');
var childs = require('./childs');
var transforms = require('./transforms');
var pkgname = new RegExp(RegExp.quote(process.cwd() + sep + 'node_modules' + sep) + '([^\\/\\\\]+)(\\/|\\\\)');


exports.warn = function() {

  var args = Array.prototype.slice.call(arguments, 0);
  args = ['warn'].concat(args);
  logging.apply(undefined, args);
};


exports.message = function() {

  var args = Array.prototype.slice.call(arguments, 0);
  args = ['message'].concat(args);
  logging.apply(undefined, args);
};

var oldtime;
var logging = function (level) {
  var args = Array.prototype.slice.call(arguments, 1);
  var err;
  var diff, now = new Date();
  var message;

  if (!oldtime) oldtime = now;
  diff = now - oldtime;
  oldtime = now;

  if (typeof args[0] != 'string') {

    if (args[0].message) {
      // Error object
      err = args[0];
      args[0] = err.message + ' ' + pretty_ms(diff);

      if (typeof err.filename == 'string') args[0] += '\n  ' + 'filename: ' + err.filename.white;
      if (typeof err.line == 'string') args[0] += '\n  ' + 'line: ' + err.line.white;
      if (typeof err.col == 'string') args[0] += '\n  ' + 'col: ' + err.col.white;
      if (typeof err.pos == 'string') args[0] += '\n  ' + 'pos: ' + err.pos.white;
      if (typeof err.stack == 'string') args[0] += '\n  ' + err.stack;

    }
    else {
      args[0] = inspect(args[0], {colors: true});
    }
  }

  message = format.apply(undefined, args);
  if (!err) message = message + ' ' + pretty_ms(diff);

  switch (level) {
    case 'warn':
      console.log('[' + META.name.magenta + '] ' + message);
      break;
    case 'message':
      console.log('[' + META.name.cyan + '] ' + message);
      break;
    default:
      console.log('[ERROR-level] '.blue + message);
      break;
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
      folders.push(config.js, config.css, config.components, config.src);
      break;
    case 'build':
      folders.push(config.distPublic, config.distViews);
      break;
  }
  // compose our own eraser
  eraser = async.compose( async.each.partial(undefined, rimraf, undefined) , glob, dirfiles);
  // looping the folders to empty
  if (config.warning) exports.message('Start to clean folers:\n    - ' + folders.join('\n    - '));
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

exports.browserify = function(files, options, callback){

  var options_not_allowed = config.browserifyNotAllowed;
  var bundle, exposes, externals, ignores;
  var files_copy = files.slice();
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
  if (exposes === true || ( typeof exposes == 'string' && ['*', '**', 'all'].indexOf(exposes.toLowerCase()) >= 0 )) {
    for(i = 0, len = files_copy.length; i < len; i++) {
      //bundle.require( files[0], {expose: basename(files[0])});
      bundle.require( files_copy[0], {expose: browserify_expose(files_copy[0])})
    }
    files_copy = []; // all the files are required.
  }

  /// convert string to array -- exposes, externals and ignores
  if (typeof exposes == 'string' && files_copy.length > 0) {
    // if exposes == *, all or ALL, files.length will be zero
    exposes = exposes.replace(/\s/g, '').split(',');
  }

  if (typeof externals == 'string') externals = externals.replace(/\s/g, '').split(',');
  if (typeof ignores == 'string') ignores = ignores.replace(/\s/g, '').split(',');


  /// require file by name:disclose
  if (Array.isArray(exposes)) {
    exposes.forEach(function(expose) {

      debug('LOOP-expose: %s', expose.magenta);

      var names = expose.split(':');
      var name = names[0];
      var node_module = isBrowserifyNodeModule(name);
      var disclose = names[1];
      var i, len;

      for(i = 0; i < files_copy.length; i++) {

        debug('LOOP i:%s, file[i]:%s', i, files_copy[i].magenta);

        if (node_module && isBrowserifyNodeModule(files_copy[i]) == node_module) {

          /// expose name not equal the node_module belong to, is specific expose
          if (name != node_module ) {
            if (name != files_copy[i]) {
              exports.warn('expose:"%s" is different from "%s" and not module name of %s. will not expose %s.', name.magenta, files_copy[i].magenta, node_module.magenta, files_copy[i].magenta);
              break;
            }
            // name == files[i]
            bundle.require( files_copy[i], {expose: files_copy[i]});
            files_copy.splice(i, 1);
            i--;

            break;
          }

          /// expose name equal to node_module belong to, all modules expose, but, warn if not the same
          if (files_copy[i] != name) exports.warn('exposes:"%s" is different from %s, but expose anyway. other browserify bundle should external/require %s instead', name.magenta, files_copy[i].magenta, files_copy[i].magenta);
          bundle.require( files_copy[i], { expose: files_copy[i]});
          files_copy.splice(i, 1);
          i--;
          break;
        }

        // file found for expose
        if (!node_module && !isBrowserifyNodeModule(files_copy[i]) && name == basename(files_copy[i])) {

          debug('#browserify local file start to bundle');

          bundle.require( resolve(files_copy[i]), {expose: localfile_expose(files_copy[i], disclose)});
          files_copy.splice(i, 1);
          i--;
          break;
        }
      }
    });
  }

  // add the files left to browserify
  for(i = 0, len = files_copy.length; i < len; i++) {
    bundle.add(files_copy[i]);
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

  bundle.transform(transforms({
    viewEngines: config.viewEngines,
    logging: exports.message,
    warn: exports.warn}));

  bundle.bundle(callback);
};

var localfile_expose = function (path, expose) {
  expose = typeof expose == 'string' ? expose : null;
  return expose || basename(path);
};

var browserify_expose = function (path) {
  var node_module = isBrowserifyNodeModule(path);

  if (!node_module) return basename(path);

  return path;
};

var isBrowserifyNodeModule = function (path) {

  var resolved;
  try {
    resolved = require.resolve(path);

    debug('resolved %s and package: %s', resolved.magenta, pkgname.exec(resolved)[1]);

    return resolved == path ? path : pkgname.exec(resolved)[1]; // will throw error even a local file is resolved
  }
  catch (err) {
    return false;
  }
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
 * @param {bool|string} [concat]
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
};

exports.cleanCSS = function(codes, callback){

  exports.useChilds('clean-css.js', codes, callback);
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
    error: function(err) {
      debug('node-sass render error');
      callback(err);
    },
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

  if (ms < 1000) return (ms + 'ms').white;
  return (( Math.round( ms / 100) / 10 ) + 's' ).white;
};