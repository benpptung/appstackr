/**
 * User: benpptung
 * Date: 2014/2/4
 * Time: PM12:27
 */

var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var util = require('util');
var path = require('path'),
    relative = path.relative,
    basename = path.basename;
var crypto = require('crypto'),
    Hash = crypto.createHash;

var Gaze = require('gaze').Gaze;
var extend = require('node.extend');
var glob = require('glob');
var async = require('async');
var debug = require('debug')('appstackr:Task');
var colors = require('colors');

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

var natures = exports.natures = /^(js|jhtml|css|chtml|html)$/;

exports.create = function(stack, done){
  var task = new Task(stack),
      err;

  if (err = any_error.call(task)) return done(err);

  // transform the Task.files to task.files
  async.concatSeries(stack.files, files_glob.bind(task), function(err, files){
    if (err) return done(err);

    if (files.length == 0 && config.warning) utils.error(new SyntaxError('Found no file in stack:' + stack.name + ' nature:' + stack.nature));

    task.files = files;
    //Object.freeze(task);
    done(null, task);
  })
};

function Task(stack){

  EventEmitter.call(this);

  extend(this, {
    filename : stack.name,
    nature : stack.nature,
    //commonjs: typeof stack.commonjs == 'string' && commonjsLinkers.test(stack.commonjs) ? stack.commonjs : undefined,
    commonjs: stack.commonjs || null,
    browserify: stack.browserify || null,
    concat: stack.hasOwnProperty('concat') ? stack.concat : true, // only for html
    autoprefixer: stack.autoprefixer ? stack.autoprefixer : null,
    ext: stack.ext || null,
    _patterns: stack.files.map(stackfiles_to_patterns).filter(Boolean), // glob file patterns
    _stack: stack
  });

  if (this.ext && typeof this.ext == 'string' && !/^\./.test(this.ext)){
    this.ext = '.' + this.ext; // ext format consistent, e.g .html or .swig
  }

  if (this.browserify && !this.commonjs) this.commonjs = true; // enable commonjs automatically if browserify config found
  if (this.concat === false && this.nature != 'html') this.concat = true; // enable concat automatically, if not view tempalte

  if (config.filesWatch) {
    this._gaze = new Gaze(this._patterns);
    this._gaze_timer = null; // timer used by _watcher
    this._on_files_watcher = files_watcher.bind(this);
    this._stack_hex = Hash('md5').update(JSON.stringify(this._stack)).digest('hex');

    this._gaze.on('all', this._on_files_watcher);
  }

}

util.inherits(Task, EventEmitter);

/**
 * @param {Function} callback
 */
Task.prototype.run = function(callback){
  var filename = this.filename;
  var nature = this.nature;
  // decide the files loader
  utils.message('start to stack %s:%s', filename.magenta, nature.magenta);
  this.concat ? concat_runner.call(this, logging) : non_concat_htmlrunner.call(this, logging);

  function logging(err) {
    if (err) return callback(err);
    utils.message('stack %s:%s written', filename.magenta, nature.magenta);
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

  return parts.length < 2 ? this[prop] == parts[0] : this.filename == parts[0] && this.nature == parts[1];
};

var concat_runner = function(callback){
  var loader = /^(css|chtml)$/.test(this.nature)
        ? ( this.autoprefixer ? css.partial(undefined, this.autoprefixer, undefined) : css )
        : ( !this.commonjs ? concat : browserify.partial(undefined, this.browserify, undefined) );
              //( this.commonjs == 'webmake' ? webmake : browserify )),
  var runner;
  var dest;
  var that = this;

  switch (this.nature){
    case 'css':
      dest = path.join( config.css, this.filename + '.min.css');
      runner = async.compose(cleanCSS, loader);
      break;
    case 'chtml':
      dest = path.join( config.snippet, this.filename + '-css.html');
      runner = async.compose(cleanCSS, loader);
      break;
    case 'js':
      dest = path.join( config.js, this.filename + '.min.js');
      runner = async.compose( uglify, loader);
      break;
    case 'jhtml':
      dest = path.join( config.snippet, this.filename + '-js.html');
      runner = async.compose( uglify, loader);
      break;
    case 'html':
      dest = path.join( config.snippet, this.filename + (this.ext ? this.ext : '.html'));
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
      callback
    );
  });
};

var non_concat_htmlrunner = function(callback){
  var that = this;
  var mover = function(file, done){
    var dest = path.join(config.snippet, that.filename, path.basename(file)),

        loader = config.viewMini ?
            async.compose(htmlcompressor, async.apply(fs.readFile, file, 'utf8')) :
            async.apply(fs.readFile, file),

        run = async.compose( async.apply(fs.writeFile, dest), loader, mkdirp);

    run(path.dirname(dest), done);
  };

  async.each(this.files, mover, callback);
};

var any_error = function(){
  if (!this.filename || typeof this.filename != 'string' || /[^A-Za-z0-9_-]/.test(this.filename)) {
    return new TypeError('invalid Task name:' + this.filename);
  }
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
      reg = /\.js$/; // there is no reason to set js extension name in profile
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

  if (basename(file) == file && this.commonjs) {
    // this is a local node module
    return done(null, [file]);
  }


  // collect the files according to the file, process.cwd() is the base_path in profile
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

  debug('this._patterns: %s', this._patterns);
  debug('event: %s', event);
  debug('filepath: %s', filepath);

  // Gaze watcher
  clearTimeout(this._gaze_timer);

  var that = this;
  var runner = this.run.bind(this, function(err){
    if (!err) that.emit('changed', that);
    that.emit('finish', that);
  });

  this._gaze_timer = setTimeout(runner, 500); // trottle -- Gaze might trigger events multiple times,
};

var stackfiles_to_patterns = function(file) {

  if (basename(file) != file) return file;

  var resolved;
  try {
    resolved = require.resolve(file);
    if (resolved == file) return; // global module

    return relative(process.cwd(), resolved);
  } catch (er){ } // resolve failed, drop it.

  //return relative(process.cwd(), require.resolve(file));
  //return basename(file) == file ? path.join('node_modules', file, '**', '*.*') : file;
};