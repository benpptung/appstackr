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
    join = path.join,
    relative = path.relative,
    extname = path.extname,
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
var postcss = require('postcss');
var autoprefixer = require('autoprefixer-core');
var glob = require('glob');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var colors = require('colors');
var debug = require('debug')('appstackr:utils');
var CleanCSS = require('clean-css');
//var reactTools = require('react-tools');
var babel = require('babel-core');

var config = require('./globals').config,
    META = config.META;
var jar_ext_path = path.resolve(__dirname, '..', 'ext', 'htmlcompressor-1.5.3.jar');
var childs = require('./childs');
var transforms = require('./transforms');
var pkgname = new RegExp(RegExp.quote(process.cwd() + sep + 'node_modules' + sep) + '([^\\/\\\\]+)(\\/|\\\\)');


exports.warn = function () {

  var args = Array.prototype.slice.call(arguments, 0);
  args = ['warn'].concat(args);
  logging.apply(undefined, args);
};


exports.message = function () {

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

exports.clean = function (command, callback) {
  // variables declare
  var folders = [], eraser;
  if (typeof command == 'function') {
    callback = command;
    command = 'build';
  }
  command = (command && typeof command == 'string' && command == 'stack') ? 'stack' : 'build';
  callback = typeof callback == 'function' ? callback : function () {
  };

  // set folders to clean
  switch (command) {
    case 'stack':
      folders.push(config.js, config.css, config.components, config.src);
      break;
    case 'build':
      folders.push(config.distPublic, config.distViews);
      break;
  }
  // compose our own eraser
  eraser = async.compose(async.each.partial(undefined, rimraf, undefined), glob, dirfiles);
  // looping the folders to empty
  if (config.warning) exports.message('Start to clean folers:\n    - ' + folders.join('\n    - '));
  async.each(folders, eraser, callback);

  // build the path to ensure we only empty the files under the directory
  function dirfiles(dir_path, done) {
    done(null, path.join(dir_path, '*'));
  }
};

/**
 * This is a wrapper to make mkdirp callback signature consistent, because
 * mkdirp callback signature is unconsistent if new made directory happen
 * @param {string} p - path to mkdirp
 * @param callback
 */
exports.mkdirp = function (p, callback) {
  mkdirp(p, function (err, done) {
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
exports.extnameReg = function (arr, flags) {
  var pattern;
  flags = flags || '';

  if (arr.length == 0 || !Array.isArray(arr)) {
    return {
      test: function () {
        return false
      }
    };
  }
  arr = arr.map(function (ext_name) {
    return RegExp.quote(ext_name.toString());
  });
  pattern = '(' + arr.join('|') + ')$';
  return new RegExp(pattern, flags);
};


// exports - loader

exports.browserify = function (files, options, callback) {

  var options_not_allowed = config.browserifyNotAllowed;
  var bundle, exposes, externals, ignores;
  var files_copy = files.slice();
  var i, len; // looping variables

  /// ensure options is object and callback is function
  if (arguments.length < 3) callback = typeof options == 'function' && options;
  callback = typeof callback == 'function' ? callback : function () {};
  if (!options || typeof options != 'object') options = {};

  /// convert true to global config
  if (options.browserify === true) options.browserify = config.browserify; /// use appstackr_settings.json and config.js
  if (options.autoprefixer === true) options.autoprefixer = config.autoprefixer;

  /// make sure options.browserify is an object
  if (!options.browserify || typeof options.browserify != 'object') options.browserify = {};


  exposes = options.browserify.exposes;
  externals = options.browserify.externals;
  ignores = options.browserify.ignores;

  for (i = 0, len = options_not_allowed.length; i < len; i++) {
    /// delete un-wanted option if it is more user friendly.
    delete options.browserify[options_not_allowed[i]];
  }

  bundle = browserify(options.browserify);

  /// all files should be required
  if (exposes === true || ( typeof exposes == 'string' && ['*', '**', 'all'].indexOf(exposes.toLowerCase()) >= 0 )) {
    for (i = 0, len = files_copy.length; i < len; i++) {
      //bundle.require( files[0], {expose: basename(files[0])});
      bundle.require(files_copy[i], {expose: browserify_expose(files_copy[i])})
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
    exposes.forEach(function (expose) {

      debug('LOOP-expose: %s', expose.magenta);

      var names = expose.split(':');
      var name = names[0];
      var node_module = isBrowserifyNodeModule(name);
      var disclose = names[1];
      var i, len;

      for (i = 0; i < files_copy.length; i++) {

        debug('LOOP i:%s, file[i]:%s', i, files_copy[i].magenta);

        if (node_module && isBrowserifyNodeModule(files_copy[i]) == node_module) {

          /// expose name not equal the node_module belong to, is specific expose
          if (name != node_module) {
            if (name != files_copy[i]) {
              exports.warn('expose:"%s" is different from "%s" and not module name of %s. will not expose %s.', name.magenta, files_copy[i].magenta, node_module.magenta, files_copy[i].magenta);
              break;
            }
            // name == files[i]
            bundle.require(files_copy[i], {expose: files_copy[i]});
            files_copy.splice(i, 1);
            i--;

            break;
          }

          /// expose name equal to node_module belong to, all modules expose, but, warn if not the same
          if (files_copy[i] != name) exports.warn('exposes:"%s" is different from %s, but expose anyway. other browserify bundle should external/require %s instead', name.magenta, files_copy[i].magenta, files_copy[i].magenta);
          bundle.require(files_copy[i], {expose: files_copy[i]});
          files_copy.splice(i, 1);
          i--;
          break;
        }

        // file found for expose
        if (!node_module && !isBrowserifyNodeModule(files_copy[i]) && name == basename(files_copy[i])) {

          debug('#browserify local file start to bundle');

          bundle.require(resolve(files_copy[i]), {expose: localfile_expose(files_copy[i], disclose)});
          files_copy.splice(i, 1);
          i--;
          break;
        }
      }
    });
  }

  // add the files left to browserify
  for (i = 0, len = files_copy.length; i < len; i++) {
    bundle.add(files_copy[i]);
  }

  if (Array.isArray(externals)) {
    for (i = 0, len = externals.length; i < len; i++) {
      if (typeof externals[i] == 'string') {
        bundle.external(externals[i]);
      }
    }
  }

  if (Array.isArray(ignores)) {
    for (i = 0, len = ignores.length; i < len; i++) {
      if (typeof ignores[i] == 'string') {
        bundle.ignore(ignores[i]);
      }
    }
  }

  bundle.transform(transforms({
    warning: config.warning,
    viewMini: config.viewMini,
    viewEngines: config.viewEngines,
    cssExtnames: config.cssExtnames,
    jsEXNames: config.jsEXNames,
    babel: config.babel,
    filecopy: {
      moveExtnames: config.moveExtnames,
      imgDir: config.img
    },
    autoprefixer: options.autoprefixer,
    logging: exports.message,
    warn: exports.warn,
    cssTransform: exports.cssTransform,
    //reactTransform: exports.react,
    htmlcompressor: exports.htmlcompressor
  }));

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

var isBrowserifyNodeModule = function (module_path) {

  //var relative = path.relative(process.cwd(), module_path);
  var resolved;
  try {


    resolved = require.resolve(relative(__dirname, join(process.cwd(), 'node_modules', module_path)));

    debug('%s resolved %s and package: %s', module_path.magenta, resolved.magenta, pkgname.exec(resolved)[1]);

    return resolved == module_path ? module_path : pkgname.exec(resolved)[1]; // will throw error even a local file is resolved
  }
  catch (err) {
    return false;
  }
};

exports.css = function (files, browsers, callback) {

  if (arguments.length == 2) {
    callback = typeof browsers == 'function' ? browsers : function () {
    };
    browsers = false;
  }

  async.mapSeries(files, exports.cssByFile, function (err, res) {
    if (err) return callback(err);
    var codes = res.join('\n');
    exports.autoprefixer(codes, browsers, callback);


    /*if (browsers === true) browsers = config.autoprefixer;
    if (typeof browsers == 'string' || Array.isArray(browsers)) {
      codes = autoprefixer({browsers: browsers, cascade: config.beautify}).process(codes).css;
    }

    //return callback(null, res.join('\n'));
    return callback(null, codes);*/
  });
};

exports.cssTransform = function (codes, options, callback) {
  var autoprefixer = options.autoprefixer;

  exports.cssByContent(codes, options, fn1);

  function fn1(err, codes) {
    if (err) return callback(err);
    exports.autoprefixer(codes, autoprefixer, fn2);
  }

  function fn2(err, codes) {
    if (err) return callback(err);
    exports.cleanCSS(codes, callback);
  }
};

exports.autoprefixer = function (codes, options, callback) {
  if (arguments.length == 2) {
    callback = typeof options == 'function' && options;
    options = false; // false means no auto-prefixer
  }
  callback = typeof callback == 'function' ? callback : function () {};
  if (options === true) options = config.autoprefixer;
  if (typeof options == 'string' || Array.isArray(options)) {
    try {
      // codes = autoprefixer({browsers: options, cascade: config.beautify}).process(codes).css;
      // since autoperfixer 5.2.0
      postcss([autoprefixer({browsers: options, cascade: true})])
        .process(codes)
        .then(function(result) {

          if (config.warning) {
            result.warnings().forEach(function(warn) {
              exports.warn(warn.toString());
            });
          }

          callback(null, result.css);
        });
    } catch (err) { callback(err); }

    return; // since autoprefixer 5.2.0
  }
  return callback(null, codes);
};

exports.cssByFile = function (file, callback) {

  var paths = [path.dirname(file)];
  var filename = path.basename(file);

  fs.readFile(file, 'utf8', function (err, content) {
    if (err) return callback(err);
    exports.cssByContent(content, {filename: filename, paths: paths}, callback);
  })
};

exports.cssByContent = function (content, options, callback) {

  if (arguments.length != 3) {
    throw new ReferenceError(format('utils.cssByContent need 3 args but got %s', inspect(arguments)));
  }

  if (!options ||
    typeof options != 'object' ||
    typeof options.filename != 'string' ||
    !Array.isArray(options.paths) ||
    options.paths.length == 0 ||
    typeof options.paths[0] != 'string') {
    return callback(new TypeError(format('invalid options %s', inspect(options))));
  }
  if (content == '') content = ' '; /// avoid empty string error

  var paths = options.paths;
  var filename = options.filename;

  paths.push(join(process.cwd(), 'node_modules'));

  var extname = path.extname(filename);
  switch (extname) {
    case '.less':
      less.render(
        content,
        {paths: paths, filename: filename},
        function (err, res) {
          callback(err, res.css);
        });
      return;

    case '.scss':
      return exports.sassRender(content, paths, callback);

    case '.styl':
      stylus(content)
        .set('filename', filename)
        .set('paths', paths)
        .render(callback);
      return;

    default:
      return callback(null, content);
  }

};

/**
 * Deprecated -- this function was done before react switch to babel
 * @param codes
 * @param callback
 */
// exports.react = function (codes, callback) {
//
//   try {
//     // react 1.0 will be in favor in babel
//     // codes = reactTools.transform(codes);
//     // codes = babel.transform(codes).code;
//   }
//   catch (err) { callback(err); }
//
//   callback(null, codes);
// };

// var concat_hook_react = async.seq(fs.readFile, exports.react);

/**
 * transform all enhanced js codes to javascript
 * Not all js files need this, e.g. es5 files
 * In the future, es6, es7 files
 *
 * Technically, this function transform all enhanced js codes to
 * utlify acceptable js files, or normal browser supported files
 *
 * @param {String|Buffer} codes
 * @param callback({Error}, {String})
 */
exports.jsEX = function(codes, callback) {
  try {
    codes = babel.transform(codes, config.babel).code;
  } catch (er) {
    callback(er);
  }
  callback(null, codes);
};

var concat_hook_jsEX = async.seq(fs.readFile, exports.jsEX);


/**
 * @param {Array} files
 * @param {bool|string} [concat]
 * @param {function} callback
 */
exports.concat = function (files, callback) {

  //async.mapSeries(files, fs.readFile.partial(undefined, 'utf8', undefined), function (err, res) {
  //  if (err) return callback(err);
  //  callback(null, res.join('\n'));
  //});

  async.mapSeries(files,
    function (file, done) {
      /// enhanced js files transform hooks here
      var ext = extname(file);

      // remove ext === '.js' someday when uglify-js upgraded for new browsers, if possible, we DO NOT transpile!
      (config.jsEXNames.indexOf(ext) >= 0 || ext === '.js') ?
        concat_hook_jsEX(file, done) : fs.readFile(file, 'utf8', done);

      /*switch (ext){
        case '.jsx':
          concat_hook_react(file, 'utf8', done);
          break;
        default:
          fs.readFile(file, 'utf8', done);
          return;
      }*/
  },
    function (err, res) {
      if (err) return callback(err);
      callback(null, res.join('\n'));
  })
};

// exports - Minifiers

exports.uglify = function (codes, callback) {
  exports.useChilds('uglifyjs.js', codes, callback);
};

exports.cleanCSS = function (codes, callback) {

  try {
    /// this is a sync function
    if (!config.beautify) {
      codes = (new CleanCSS({
        keepSpecialComments: 0,
        processImport: false,
        rebase: true
      })).minify(codes).styles;
    }
    callback(null, codes);
  } catch (err) {
    callback(err);
  }
  ///exports.useChilds('clean-css.js', codes, callback);
};

exports.useChilds = function (module_name, codes, callback) {

  childs({
    modulename: module_name,
    config: config
  })
    .on('error', function (error) {
      exports.warn(error);
    })
    .on('message', function (message) {
      if (config.warning) exports.message(message);
    })
    .run(codes, callback);

};

/**
 *
 * @param {string} codes
 * @param {function} callback - ({Error}, {Buffer})
 */
exports.htmlcompressor = function (codes, callback) {
  var compressor,
    java_options = [],
    result_buffs = [],
    error_buffs = [];

  java_options.push('-jar', jar_ext_path, '--remove-intertag-spaces');
  if (config.viewCSSMini) java_options.push('--compress-css');
  if (config.viewJsMini) java_options.push('--compress-js');

  compressor = spawn('java', java_options);
  compressor.stdout.on('data', function (chunk) {
    result_buffs.push(chunk);
  });
  compressor.stderr.on('data', function (chunk) {
    error_buffs.push(chunk);
  });
  compressor.on('close', function (code) {
    if (code != 0) return callback(new Error(Buffer.concat(error_buffs).toString()));
    callback(null, Buffer.concat(result_buffs));
  });
  compressor.stdin.end(codes);
};

/**
 *
 * @param {String} content
 * @param {Array} includes
 * @param {Function} callback
 */
exports.sassRender = function (content, includes, callback) {

  sass.render({
    data: content,
    includePaths: includes,
    outputStyle: 'expanded'
  }, function(err, res) {
    if (err) return callback(err);
    callback(null, res.css.toString('utf8'));
  });

  /*sass.render({
   data: content,
   includePaths: includes,
   success: async.apply(callback, null),
   error: callback
   })*/

  /*sass.render({
    data: content,
    includePaths: includes,
    error: function (err) {
      debug('node-sass render error');
      callback(err);
    },
    success: function (res) {
      callback(null, res.css);
    }
  })*/
};

/**
 *
 * @param {*} stream
 * @returns {boolean}
 */
exports.isReadable = function (stream) {
  return stream instanceof Readable || stream instanceof Stream;
};

var pretty_ms = function (ms) {

  if (ms < 1000) return (ms + 'ms').white;
  return (( Math.round(ms / 100) / 10 ) + 's' ).white;
};
