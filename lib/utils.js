/**
 * User: benpptung
 * Date: 2014/2/2
 * Time: PM7:51
 */

    // modules required
var profile = require('./profile'),
    async = require('async'),
    fs = require('fs'),
    path = require('path'),
    browserify = require('browserify'),
    //webmake = require('webmake'),
    uglify = require('uglify-js'),
    less = require('less'),
    sass = require('node-sass'),
    autoprefixer = require('autoprefixer-core'),
    CleanCSS = require('clean-css'),
    ycssmin = require('ycssmin').cssmin,
    prettyjson = require('prettyjson'),
    spawn = require('child_process').spawn,
    glob = require('glob'),
    rimraf = require('rimraf'),
    mkdirp = require('mkdirp');

var jar_ext_path = path.resolve(__dirname, '..', 'ext', 'htmlcompressor-1.5.3.jar');

/**
 *  Global exports
 */
if (typeof Function.prototype.partial != "function"){

  Function.prototype.partial = function(){

    var fn = this, args = Array.prototype.slice.call(arguments);
    return function(){
      var idx = 0, new_args = [];
      for(var i = 0, len = args.length; i < len ; i++){

        new_args[i] = args[i] === undefined ? arguments[idx++] : args[i];
      }
      return fn.apply(this, new_args);
    }
  };
}


if (typeof RegExp.quote != "function"){
  RegExp.quote = function(string){
    return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
  };
}

/**
 * Local exports - utilities
 */

exports.error = function(err){
  if (!(err instanceof Error)) err = { name : 'UnregulatedError', message: err.toString('utf8')};
  console.error(prettyjson.render(err));
};

exports.log = function(message){
  if (typeof message == 'string') message = { message: message};
  console.log(prettyjson.render(message));
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
      folders.push(profile.js, profile.css, profile.snippet, profile.src);
      break;
    case 'build':
      folders.push(profile.distPublic, profile.distViews);
      break;
  }
  // compose our own eraser
  eraser = async.compose( async.each.partial(undefined, rimraf, undefined) , glob, dirfiles);
  // looping the folders to empty
  if (profile.warning) exports.log('Start looping to clean folers:\n    - ' + folders.join('\n    - '));
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
 * @param {String} flags
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

exports.browserify = function(files, callback){
  browserify(files).bundle(callback);
};

exports.css = function(files, browsers, callback){

  if (arguments.length == 2 && typeof browsers == 'function') {
    callback = browsers;
    browsers = false;
  }


  async.mapSeries(files, function(file, done){

    // read the file indicated in the files array, and convert them onto codes
    var paths = [path.dirname(file)], filename = path.basename(file);
    fs.readFile(file, 'utf8', function(err, content){

      var extname = path.extname(file);
      switch (extname){
        case '.less':
          return less.render(
                  content,
                  {paths: paths, filename: filename},
                  function(err, res){
                    if (err) return done(err);
                    done(null, res.css);
                  });
        case '.scss':
          return exports.sassRender(content, paths, done);
        default:
          return done(null, content);
      }
      // maybe we can add .styl ....but let us stick on less & sass now

    })
  }, function(err, res){
    if (err) return callback(err);

    var codes = res.join('\n');
    if (browsers === true) browsers = profile.autoprefixer;
    if (typeof browsers == 'string' || Array.isArray(browsers)) {
      codes = autoprefixer({browsers: browsers, cascade: profile.beautify}).process(codes).css;
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

/**
 * @param {string} codes
 * @param {function} callback
 */
exports.uglify = function(codes, callback){

  if (Buffer.isBuffer(codes)) codes = codes.toString('utf8');

  var res = uglify.minify(codes, {
    warnings: profile.warning,
    fromString: true,
    output: { beautify: profile.beautify},
    compress: { warnings:profile.warning, unsafe: true}
  });
  callback(null, res.code);
};

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
 */
exports.cleanCSS = function(codes, callback){
  if (profile.beautify) return callback(null, codes);

  var minified = (new CleanCSS({
    keepSpecialComments: 0,
    processImport: false,
    rebase: true
  })).minify(codes).styles;
  callback(null, minified);
};

/**
 *
 * @param codes
 * @param callback
 */
exports.ycssmin = function(codes, callback){
  if (profile.beautify) return callback(null, codes);
  var minified = ycssmin(codes);
  callback(null, minified);
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
  if (profile.viewCSSMini) java_options.push('--compress-css');
  if (profile.viewJsMini) java_options.push('--compress-js');

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
}

