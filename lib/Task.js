/**
 * User: benpptung
 * Date: 2014/2/4
 * Time: PM12:27
 */

var EventEmitter = require('events').EventEmitter,
    fs = require('fs'),
    util = require('util'),
    extend = require('node.extend'),
    glob = require('glob'),
    async = require('async'),
    path = require('path'),
    profile = require('./profile'),
    tasklist = require('./tasklist'),
    utils = require('./utils'),
    //webmake = utils.webmake,
    browserify = utils.browserify,
    css = utils.css,
    cleanCSS = utils.cleanCSS,
    uglify = utils.uglify,
    concat = utils.concat,
    mkdirp = utils.mkdirp,
    htmlcompressor = utils.htmlcompressor;


var natures = tasklist.natures,
    commonjsLinkers = tasklist.commonjsLinkers;

exports.create = function(stack, done){
  var task = new Task(stack),
      err;

  if (err = any_error.call(task)) return done(err);

  // transform the Task.files to task.files
  async.concatSeries(stack.files, files_glob.bind(task), function(err, files){
    if (err) return done(err);

    if (files.length == 0 && profile.warning) utils.error(new SyntaxError('Found no file in stack:' + stack.name + ' nature:' + stack.nature));
    task.files = files;
    Object.freeze(task);
    done(null, task);
  })
};

function Task(stack){
  EventEmitter.call(this);
  extend(this, {
    name : stack.name,
    nature : stack.nature,
    commonjs: typeof stack.commonjs == 'string' && commonjsLinkers.test(stack.commonjs) ? stack.commonjs : undefined,
    concat: stack.hasOwnProperty('concat') ? stack.concat : true,
    autoprefixer: stack.autoprefixer ? stack.autoprefixer : undefined
  });
}

util.inherits(Task, EventEmitter);

/**
 * @param {Function} callback
 */
Task.prototype.run = function(callback){
  // decide the files loader
  this.concat ? concat_runner.call(this, callback) : non_concat_htmlrunner.call(this, callback);
};

var concat_runner = function(callback){
  var loader = /^(css|chtml)$/.test(this.nature)
        ? ( this.autoprefixer ? css.partial(undefined, this.autoprefixer, undefined) : css )
        : ( !this.commonjs ? concat : browserify ),
              //( this.commonjs == 'webmake' ? webmake : browserify )),
      runner,
      dest;

  switch (this.nature){
    case 'css':
      dest = path.join( profile.css, this.name + '.min.css');
      runner = async.compose(cleanCSS, loader);
      break;
    case 'chtml':
      dest = path.join( profile.snippet, this.name + '-css.html');
      runner = async.compose(cleanCSS, loader);
      break;
    case 'js':
      dest = path.join( profile.js, this.name + '.min.js');
      runner = async.compose( uglify, loader);
      break;
    case 'jhtml':
      dest = path.join( profile.snippet, this.name + '-js.html');
      runner = async.compose( uglify, loader);
      break;
    case 'html':
      dest = path.join( profile.snippet, this.name + '.html');
      runner = profile.viewMini ? async.compose(htmlcompressor, loader) : loader;
      break;
    default:
      return callback(new SyntaxError('unrecognized nature:' + this.nature));
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
    var dest = path.join(profile.snippet, that.name, path.basename(file)),

        loader = profile.viewMini ?
            async.compose(htmlcompressor, async.apply(fs.readFile, file, 'utf8')) :
            async.apply(fs.readFile, file),

        run = async.compose( async.apply(fs.writeFile, dest), loader, mkdirp);

    run(path.dirname(dest), done);
  };

  async.each(this.files, mover, callback);
};

var any_error = function(){
  if (!this.name || typeof this.name != 'string' || /[^A-Za-z0-9_-]/.test(this.name)) {
    return new TypeError('invalid Task name:' + this.name);
  }
  if (!this.nature || typeof this.nature != 'string' || !natures.test(this.nature)) {
    return new TypeError('invalid Task nature:' + this.nature + ' in stack:' + this.name);
  }

  // integrity check
  if (commonjsLinkers.test(this.commonjs) && !/^(js|jhtml)$/.test(this.nature)) {
    return new TypeError(this.nature + ' will not have commonjs interface in stack:' + this.name);
  }

};

/**
 * glob the files according to the file described in appstack
 * @param {string} file
 * @param {callback} done
 */
var files_glob = function(file, done){
  var nature = this.nature,
      reg;

  // decide the files regexp according to the nature
  switch (nature){
    case 'js':
    case 'jhtml':
      reg = /\.js$/; // there is no reason to set js extension name in profile
      break;
    case 'css':
    case 'chtml':
      // for less nature, css is acceptable
      reg = utils.extnameReg(profile.cssExtnames);
      break;
    case 'html':
      reg = utils.extnameReg(profile.viewEngines);
      break;
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