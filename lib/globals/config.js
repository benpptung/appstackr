/**
 * User: benpptung
 * Date: 2014/2/4
 * Time: PM6:58
 */

// modules
require('./native');

var path = require('path');
var extend = require('node.extend');
var fs = require('fs');


// variables
var META = require('../../package.json');
var profile_file = 'appstackr-settings.json';
var base_path = process.cwd();
var settings;

  /// Default Config
var defaults = {

      // url
      cdn: "http://localhost:3000",
      srcmapUrl: "http://localhost:3000",

      // options for appstack
      warning: false,
      reserved: [], // can try Angular DI reserved words,
                                     // e.g.['$scope','$http']
      beautify: false,
      stackLimit: 20,
      cleanStacks: false,
      cleanDist: true,
      autoprefixer: [
        "Android 2.3",
        "Android >= 4",
        "Chrome >= 20",
        "ff >= 24",
        "ie >= 8",
        "iOS >= 6",
        "Opera >= 12",
        "Safari >= 6"
      ],
        // should I add option here to enable appstack to clean js/css/jhtml folders? is it save or stupid?

      // options for files watch & browser-sync

      filesWatch: false, // just a reminder here, not allow to be set
      bsyncEnable: false, // just a reminder here, not allow to be set
        // browser-sync config
      bsync: {
        // files is default to {views}/** and {public}/** patterns , which will be hard-coded in setupProperties
        browser: "google chrome",
        proxy: "0.0.0.0:3000" // default proxy to express server 3000 port, which is conventially express test port
      },

      // options for browserify
      browserify: {
        // no defaults
      },

      // options for appbuild
      viewMini: true,
      viewJsMini: false,
      viewCSSMini: true,
      viewEngines: ['.html', '.swig', '.ract', '.hbs', '.handlebars', '.mustache', '.ejs', '.haml'],
      excludes: ['.svn', '.DS_Store', '.tmp'],
      cssExtnames: ['.css', '.less', '.scss', '.styl'],
      jsEXNames: [ '.jsx', '.es', '.es6', '.babel'],
      moveExtnames: ['.files'],
      distLimit: 20,

      // base dir name
      views: "views",
      "public": "public",
      distViews: path.join('dist', 'views'),
      distPublic: path.join('dist', 'public'),

      // sub dir name under base dir
      css: "css",
      js: "js",
      img: "img",
      resource: 'resource',
      asset: "asset",
      components: "components",
      src: "src",
      origindomain: "origindomain"
    };

/**
 *
 * @namespace
 * @property {string} cdn
 * @property {string} srcmapUrl
 *
 * @property {bool}   warning
 * @property {array}  reserved
 * @property {bool}   beautify
 * @property {number} stackLimit
 * @property {Array}  cssExtnames
 * @property {Array}  jsEXNames
 * @property {Array}  moveExtnames
 * @property {bool}   cleanStacks
 * @property {Array|string|bool} autoprefixer
 *
 * @property {bool}   filesWatch
 * @property {bool}   bsyncEnable
 * @property {Object} bsync
 *
 *
 * @property {string} public
 * @property {string} views
 * @property {string} js
 * @property {string} components
 * @property {string} css
 * @property {string} img
 * @property {string} asset
 * @property {string} src
 * @property {string} origindomain
 *
 * @property {bool}   viewMini
 * @property {bool}   viewCSSMini
 * @property {bool}   viewJsMini
 * @property {array}  viewEngines
 * @property {array}  excludes
 * @property {number} distLimit
 *
 * @property {string} distViews
 * @property {string} distPublic
 *
 */
var profile = exports;

/// load customized settings from appstackr_settings.json
var custom_settings;
try {
    custom_settings =  JSON.parse((fs.readFileSync(path.join(base_path, profile_file))));
}
catch (ex){ } // appstackr_settings.json does not exist

  /*try {

    custom_settings = JSON.parse(fs.readFileSync(path.join(base_path, 'appstack_profile.json')));
    console.log('appstack_profile.json is deprecated. Use appstackr_settings.json instead');

  } catch (ex){ }
}*/

/// merge appstackr_settings.json onto defaults

  /// reserve options which need deep merge --- external plugin options
var bsync_defaults = defaults.bsync;

if (typeof custom_settings == 'object') {
  settings = extend(defaults, custom_settings);
  settings.bsync = extend(true, bsync_defaults, custom_settings.bsync);
}
else {
  settings = defaults;
}


/// Put settings onto our config -- I admin config is a bad name!
setupProperties.call(profile, ({basePath: base_path, settings: settings}));


// default options ( not configurable )
profile.browserifyNotAllowed = [];
Object.freeze(profile.browserifyNotAllowed);


/// final call by external initiater, e.g. appstack, appbuild, or appwatch

profile.final = function(options, files_watch_state){

  // handle optional options & freeze config
  options = options && typeof options == 'object' ? options : {};
  // set beautify and warning for appstack
  if (options.hasOwnProperty('beautify')) profile.beautify = options.beautify;
  if (options.hasOwnProperty('warning')) profile.warning = options.warning;
  // set views minification options
  if (options.hasOwnProperty('viewMini')) profile.viewMini = options.viewMini;
  if (options.hasOwnProperty('viewCSSMini')) profile.viewCSSMini = options.viewCSSMini;
  if (options.hasOwnProperty('viewJsMini')) profile.viewJsMini = options.viewJsMini;

  if (~['appwatch'].indexOf(files_watch_state) < 0 ) {
    // enable filesWatch if this is a files watch state
    profile.filesWatch = true;
  }

  // enable browser-sync via command
  if (profile.filesWatch === true && options.hasOwnProperty('browserSync')) {

    profile.bsyncEnable = true;

    // can set browser-sync proxy or server via command line
    if (options.server) {
      switch (typeof profile.bsync.server) {
        case 'object':
          /// if browser-sync use server mode, appstackr public directory should be the root directory
          profile.bsync.server.basedir = profile.public;
          break;

        default:
          profile.bsync.server = profile.public;
          break;
      }
    }

    if (options.proxy) {
      switch (typeof profile.bsync.proxy) {
        case 'object':
          profile.bsync.proxy.target = options.proxy;
          break;

        default:
          profile.bsync.proxy = options.proxy;
          break;
      }
    }

    /// final check to ensure no both server and proxy option for browser-sycn
    if (profile.bsync.server && profile.bsync.proxy) delete profile.bsync.proxy; /// delete proxy, because proxy is in defaults
  }

  // freeze config in non-test environment
  //var env = process.env.NODE_ENV;
  //if ( typeof env != 'string' || env != 'test') Object.freeze(config);
};

function setupProperties(options){

  /// put fixed options here

  var base_path = options.basePath;
  var settings = options.settings;

  var props = {
    //
    "META" : META,

    // url options
    "cdn" : settings.cdn,
    "srcmapUrl" : settings.srcmapUrl,

    // stacking options
    "warning"     : settings.warning,
    "reserved"    : settings.reserved,
    "beautify"    : settings.beautify,
    "stackLimit"  : settings.stackLimit,
    "cssExtnames" : settings.cssExtnames,
    "jsEXNames"  : settings.jsEXNames,
    "moveExtnames": settings.moveExtnames,
    "cleanStacks" : settings.cleanStacks,
    "cleanDist"   : settings.cleanDist,
    "autoprefixer": settings.autoprefixer,

    // options for files watch & browser-sync,
    // filesWatch & bsyncEnable set up via command
    "filesWatch"  : false,
    "bsyncEnable" : false,
    "bsync"       : settings.bsync,

    // appstack paths
    "public"   : path.join(base_path, settings.public),
    "views"    : path.join(base_path, settings.views),
    "js"       : path.join(base_path, settings.public, settings.js),
    "components"  : path.join(base_path, settings.views, settings.components),
    "css"      : path.join(base_path, settings.public, settings.css),
    "img"      : path.join(base_path, settings.public, settings.img),
    "resource" : path.join(base_path, settings.public, settings.resource),
    "asset"    : path.join(base_path, settings.public, settings.asset),
    "src"      : path.join(base_path, settings.public, settings.src),
    "origindomain" : path.join(base_path, settings.public, settings.origindomain),

    // building options
    "viewMini"   : settings.viewMini,
    "viewCSSMini": settings.viewCSSMini,
    "viewJsMini" : settings.viewJsMini,
    "viewEngines": settings.viewEngines,
    "excludes"   : RegForExtname(settings.excludes, 'i'),
    "distLimit"  : settings.distLimit,

    // appbuild paths
    "distPublic" : path.join(base_path, settings.distPublic),
    "distViews"  : path.join(base_path, settings.distViews)

  };

  /// set browser-sync to watch public and views directories
  props.bsync.files = [
    path.join(settings['public'], '**', '*.*'),
    path.join(settings.views, '**', '*.*')
  ];


  extend(this, props);
}


function RegForExtname(arr, flags){
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