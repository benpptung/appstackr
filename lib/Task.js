/**
 * User: benpptung
 * Date: 2014/2/4
 * Time: PM12:27
 */

var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var util = require('util'),
    format = util.format,
    inspect = util.inspect;
var path = require('path'),
    sep = path.sep,
    join = path.join,
    relative = path.relative,
    dirname = path.dirname,
    basename = path.basename;
var crypto = require('crypto'),
    Hash = crypto.createHash;

var Gaze = require('gaze').Gaze;
var extend = require('node.extend');
var glob = require('glob');
var async = require('async');
var debug = require('debug')('appstackr:Task');
var colors = require('colors');
var minimatch = require('minimatch');

var config = require('./globals').config;
var utils = require('./utils'),
    browserify = utils.browserify,
    css = utils.css,
    cleanCSS = utils.cleanCSS,
    uglify = utils.uglify,
    concat = utils.concat,
    mkdirp = utils.mkdirp,
    htmlcompressor = utils.htmlcompressor;

//var natures = tasklist.natures,
//    commonjsLinkers = tasklist.commonjsLinkers;

var natures = exports.natures = /^(js|jhtml|css|chtml|html|tmpl|tpl)$/;
var sep_reg = new RegExp(RegExp.quote(sep));

exports.create = function(stack, done){
  var task;
  var err;

  try {
    task = new Task(stack);
  } catch (ex) {
    return done(ex);
  }

  if (err = any_error.call(task)) return done(err);

  // transform the Task.files to task.files
  async.concatSeries(task._stack_files, files_glob.bind(task), function(err, files){
    if (err) return done(err);

    if (files.length == 0 && config.warning) utils.message('No file found in %s:%s', stack.name.magenta, stack.nature.magenta);

    task.files = files;
    debug('%s task.files added: %s', task.filename.magenta ,inspect(task.files, {colors: true}));
    done(null, task);
  })
};

function Task(stack){

  EventEmitter.call(this);

  //if (!this.filename || typeof this.filename != 'string' || /[^A-Za-z0-9_-]/.test(this.filename)) {
  if (!stack.name || typeof stack.name != 'string' || !/^[A-Za-z0-9]{1}[A-Za-z0-9_\-\\\/\.]*[A-Za-z0-9]$/.test(stack.name)) {
    throw new TypeError(format('invalid stack name: %s', inspect(stack.name)));
  }

  this._stack_files = [];
  if (typeof stack.files == 'string') this._stack_files = stack.files.replace(/\s/g, '').split(',');
  if (Array.isArray(stack.files)) this._stack_files = stack.files.slice();

  /**
   * concat option: {bool|string|array} string and array only works for html, and non-commonjs js/jhtml
   */
  extend(this, {
    filename : stack.name.replace(/(\\|\/)/g, sep),
    nature : stack.nature,
    //commonjs: typeof stack.commonjs == 'string' && commonjsLinkers.test(stack.commonjs) ? stack.commonjs : undefined,
    commonjs: stack.commonjs,
    browserify: stack.browserify,
    concat: stack.concat,
    // default autoprefixer to true if undefined
    autoprefixer: stack.autoprefixer ? stack.autoprefixer : typeof stack.autoprefixer === 'undefined',
    ext: stack.ext,
    _patterns: this._stack_files.map(stackfiles_to_patterns).filter(Boolean), // glob file patterns
    _stack: stack
  });

  if (this.ext && typeof this.ext == 'string' && !/^\./.test(this.ext)){
    this.ext = '.' + this.ext; // ext format consistent, e.g .html or .swig
  }

  if (this.browserify && !this.commonjs) this.commonjs = true; // enable commonjs automatically if browserify config found

  /// concat must be true if it is not a template stack
  if (this.concat === false && ['html', 'tmpl', 'tpl'].indexOf(this.nature) < 0) this.concat = true; // enable concat automatically, if not view tempalte

  /// apply default value to concat
  /*if (typeof this.concat != 'boolean') {
    // if the stack is template, then concat is default to false
    // or default to true
    this.concat = ['html', 'tmpl', 'tpl'].indexOf(this.nature) < 0;
  }*/
  if (typeof this.concat != 'boolean') this.concat = true;

  if (config.filesWatch) {
      /// add files to watch for re-stacking, for less, scss, styl, browserify...stacks
    this._patterns = concat_watch_to_patterns(this._patterns, stack.watch);

    debug('%s _patterns: %s', this.filename.magenta , inspect(this._patterns));

    this._gaze = new Gaze(this._patterns);
    this._gaze_timer = null; // timer used by _watcher
    this._on_files_watcher = files_watcher.bind(this);
    this._on_gaze_error = gaze_error.bind(this);
    this._stack_hex = Hash('md5').update(JSON.stringify(this._stack)).digest('hex');

    this._gaze.on('all', this._on_files_watcher);
    this._gaze.on('error', this._on_gaze_error)
  }

}

util.inherits(Task, EventEmitter);

/**
 * run will never callback error, because error is a result of stacking
 * @param {Function} callback
 */
Task.prototype.run = function(callback){
  var filename = this.filename;
  var nature = this.nature;
  // decide the files loader
  utils.message('start to stack %s:%s', filename.magenta, nature.magenta);
  this.concat ? concat_runner.call(this, logging) : non_concat_htmlrunner.call(this, logging);

  function logging(err, bytes) {

    if (err) {
      utils.warn(err);
      utils.warn('stacking %s:%s failed.', filename.magenta, nature.magenta);
      return callback();
    }

    if (!bytes) {
      utils.message('stack %s:%s written', filename.magenta, nature.magenta);
      return callback();
    }

    utils.message('stack %s:%s written %s', filename.magenta, nature.magenta, pretty_bytes(bytes));
    callback();
  }
};

/**
 *
 * @param {Object} stack new loaded stack for check
 * @returns {boolean}
 */
Task.prototype.isStack = function(stack){
  var other_stack_hex = Hash('md5').update(JSON.stringify(stack)).digest('hex');
  return this._stack_hex == other_stack_hex;
};


Task.prototype.destroy = function(){
  if (this._gaze) {
    this._gaze.removeListener('all', this._on_files_watcher);
    this._gaze.removeListener('error', this._on_gaze_error);
  }
  this.emit('destroyed');
};


/**
 * detect if nature or name valid for the filter
 * @param filter
 */
Task.prototype.filteredIn = function(filter) {
  var parts = filter.split(':');
  var prop = natures.test(parts[0]) ? 'nature' : 'filename';

  if (parts.length == 2 && prop == 'filename' ) {
    switch (parts[1]) {
      case 'j':
        parts[1] = 'js';
        break;
      case 'c':
        parts[1] = 'css';
        break;
    }
  }

  return parts.length < 2 ?
    ( prop == 'nature' ? this[prop] == parts[0] : filename_begin_with_filter(this.filename, parts[0])):
    filename_begin_with_filter(this.filename, parts[0]) && this.nature == parts[1];
};

var concat_runner = function(callback){
  var loader = /^(css|chtml)$/.test(this.nature)
        ? ( this.autoprefixer ? css.partial(undefined, this.autoprefixer, undefined) : css )
        : ( !this.commonjs ? concat : browserify.partial(undefined, { browserify: this.browserify, autoprefixer: this.autoprefixer}, undefined) );
              //( this.commonjs == 'webmake' ? webmake : browserify )),
  var runner;
  var dest;
  var filename = this.filename;
  var nature = this.nature;

  switch (this.nature){
    case 'css':
      dest = path.join( config.css, filename + '.min.css');
      runner = async.compose(cleanCSS, loader);
      break;
    case 'chtml':
      dest = !sep_reg.test(filename)
        ? path.join( config.components, filename + '.min.css')
        : path.join( config.views, filename + '.min.css');
      runner = async.compose(cleanCSS, loader);
      break;
    case 'js':
      dest = path.join( config.js, filename + '.min.js');
      runner = async.compose( uglify, loader);
      break;
    case 'jhtml':
      dest = !sep_reg.test(filename)
        ? path.join( config.components, filename + '.min.js')
        : path.join( config.views, filename + '.min.js');
      runner = async.compose( uglify, loader);
      break;
    case 'html':
    case 'tmpl':
    case 'tpl':
      dest = !sep_reg.test(filename)
        ? path.join( config.components, filename + (this.ext ? this.ext : '.html'))
        : path.join( config.views, filename + (this.ext ? this.ext : '.html'));
      runner = config.viewMini ? async.compose(htmlcompressor, loader) : loader;
      break;
    default:
      return callback(new RangeError('unrecognized nature:' + this.nature));
  }

  runner(this.files, function(err, codes){
    if (err) return callback(err);

    async.series([
      mkdirp.partial(path.dirname(dest), undefined),
      fs.writeFile.partial(dest, codes, undefined)
    ],
      function(err) {
        if (err) return callback(err);

        if (typeof codes == 'string') {
          return callback(null, Buffer.byteLength(codes, 'utf8'));
        }

        if (Buffer.isBuffer(codes)) {
          return callback(null, codes.length);
        }

        callback(new TypeError(format('%s:%s codes was written successful, however codes type should be string or buffer but got %s.', filename.magenta, nature.magenta, typeof codes)))
      }
    );
  });
};

var non_concat_htmlrunner = function(callback){
  var that = this;
  var mover = function(file, done){
    var dest = !sep_reg.test(that.filename) ?
          path.join(config.components, that.filename, basename(file)) :
          path.join(config.views, that.filename + '-' + path.basename(file));

    var loader = config.viewMini ?
          async.compose(htmlcompressor, async.apply(fs.readFile, file, 'utf8')) :
          async.apply(fs.readFile, file);

    var run = async.compose( async.apply(fs.writeFile, dest), loader, mkdirp);

    run(path.dirname(dest), done);
  };

  async.each(this.files, mover, callback);
};

var any_error = function(){

  if (!this.nature || typeof this.nature != 'string' || !natures.test(this.nature)) {
    return new TypeError('invalid Task nature:' + this.nature + ' in stack:' + this.filename);
  }

  // integrity check
  //if (commonjsLinkers.test(this.commonjs) && !/^(js|jhtml)$/.test(this.nature)) {
  if (this.commonjs && !/^(js|jhtml)$/.test(this.nature)) {
    return new TypeError(this.nature + ' will not have commonjs interface in stack:' + this.filename);
  }

};

/**
 * glob the files according to the file described in appstack
 * @param {string} file
 * @param {function} done
 */
var files_glob = function(file, done){
  var nature = this.nature;
  var reg;

  // decide the files regexp according to the nature
  switch (nature){
    case 'js':
    case 'jhtml':
      //reg = /\.(js|jsx)$/; // there is no reason to set js extension name in config
      reg = utils.extnameReg(['.js'].concat(config.jsEXNames));
      break;
    case 'css':
    case 'chtml':
      // for less nature, css is acceptable
      reg = utils.extnameReg(config.cssExtnames);
      break;
    case 'html':
      reg = utils.extnameReg(config.viewEngines);
      break;
  }

  /*if (basename(file) == file && this.commonjs) {
    // this is a local node module
    return done(null, [file]);
  }*/

  if (this.commonjs) {
    try {
      //require.resolve(file);
      require.resolve(relative(__dirname, join(process.cwd(), 'node_modules', file)));
      // no error, so this is a node module for browserify
      return done(null, [file]);
    }
    catch (er){} // if error, not a node_module
  }


  // collect the files according to the file, process.cwd() is the base_path in config
  glob(path.join(process.cwd(), file), function(err, files){
    if (err) return done(err);

    // filter out the unwanted files by filter function
    async.filter(files, filter, function(files_for_nature){
      // return the files under this nature
      done(null, files_for_nature);
    })
  });
  // for async to filter out the unwanted files
  function filter(file, cb){
    cb(reg.test(file));
  }
};


var files_watcher = function(event, filepath){

  debug('%s this.files %s', this.filename.magenta, inspect(this.files, {colors: true}));
  debug('%s this._patterns: %s',this.filename.magenta, this._patterns);
  debug('%s event: %s', this.filename.magenta, event);
  debug('%s filepath: %s', this.filename.magenta , filepath);

  // Gaze watcher
  clearTimeout(this._gaze_timer);

  var that = this;
  var runner = this.run.bind(this, function(err){
    if (!err) that.emit('changed', that);
    that.emit('finish', that);
  });

  this._gaze_timer = setTimeout(runner, 500); // trottle -- Gaze might trigger events multiple times,
};

var gaze_error = function (error) {
  this.emit(error);
};

var stackfiles_to_patterns = function(file) {

  var resolved;
  try {
    resolved = require.resolve(relative(__dirname, join(process.cwd(), 'node_modules', file)));
    //if (resolved == file) return; // global module

    return relative(process.cwd(), resolved);
  } catch (er){
    return file;
  }
};

var concat_watch_to_patterns = function(patterns, adds) {

  if (typeof adds == 'string') {
    adds = adds.replace(/\s/g, '').split(',');
  }

  if (Array.isArray(adds)) {

    adds = adds.map(stackfiles_to_patterns).filter(Boolean);
    patterns = patterns.concat(adds)
      .reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
      }, []);
  }

  return patterns;
};


var pretty_bytes = function (bytes) {

  // warn file size if less than 10K or larger than 150K
  var color = bytes > 153600 || bytes < 10240 ? 'red' : 'yellow';

  if (bytes < 1024) return colors[color](bytes + ' B');
  bytes = Math.round((bytes / 1024 ) * 100) / 100;

  return colors[color](bytes + ' KB');
};

var filename_begin_with_filter = function (filename, filter) {
  //return RegExp('^' + RegExp.quote(filter)).test(filename);
  return minimatch(filename, filter);
};