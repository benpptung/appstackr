/**
 * User: benpptung
 * Date: 2014/2/4
 * Time: PM6:58
 */

var profile_file = 'appstackr-settings.json',
    path = require('path'),
    extend = require('node.extend'),
    fs = require('fs'),
    url = require('url'),
    utils = require('./utils'),
    defaults = {
      // url
      cdn: "http://localhost:3000",
      srcmapUrl: "http://localhost:3000",

      // options for appstack
      warning: true,
      reserved: [], // can try Angular DI reserved words,
                                     // e.g.['$scope','$http']
      beautify: false,
      stackLimit: 20,
      cleanStacks: false,
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

      // options for appbuild
      viewMini: true, // should I enable this option? to skip htmlmini ?
      viewJsMini: false,
      viewCSSMini: true,
      viewEngines: ['.html', '.swig'],
      excludes: ['.svn', '.DS_Store', '.tmp'],
      cssExtnames: ['.css', '.less', '.scss'],
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
      snippet: "snippet",
      src: "src",
      origindomain: "origindomain"
    },
    base_path = process.cwd(),
    settings;
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
 * @property {bool}   cleanStacks
 * @property {Array|string|bool} autoprefixer
 *
 * @property {string} public
 * @property {string} views
 * @property {string} js
 * @property {string} snippet
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
 */
var profile = exports;

var custom_settings;

try {
    custom_settings =  JSON.parse((fs.readFileSync(path.join(base_path, profile_file))));
}
catch (ex){
  try {

    custom_settings = JSON.parse(fs.readFileSync(path.join(base_path, 'appstack_profile.json')));
    console.log('appstack_profile.json is deprecated. Use appstackr_settings.json instead');

  } catch (ex){ }
}

if (typeof custom_settings == 'object') {
  settings = extend(defaults, custom_settings);
}
else {
  settings = defaults;
}



setupProperties.call(profile, ({basePath: base_path, settings: settings}));

profile.finalProfile = function(options){
  // handle optional options & freeze profile
  options = options && typeof options == 'object' ? options : {};
  // set beautify and warning for appstack
  if (options.hasOwnProperty('beautify')) profile.beautify = options.beautify;
  if (options.hasOwnProperty('warning')) profile.warning = options.warning;
  // set views minification options
  if (options.hasOwnProperty('viewMini')) profile.viewMini = options.viewMini;
  if (options.hasOwnProperty('viewCSSMini')) profile.viewCSSMini = options.viewCSSMini;
  if (options.hasOwnProperty('viewJsMini')) profile.viewJsMini = options.viewJsMini;

  // freeze profile in non-test environment
  var env = process.env.NODE_ENV;
  if ( typeof env != 'string' || env != 'test') Object.freeze(profile);
};

function setupProperties(options){

  var base_path = options.basePath,
      settings = options.settings;

  var props = {
    // url options
    "cdn" : settings.cdn,
    "srcmapUrl" : settings.srcmapUrl,

    // stacking options
    "warning"     : settings.warning,
    "reserved"    : settings.reserved,
    "beautify"    : settings.beautify,
    "stackLimit"  : settings.stackLimit,
    "cssExtnames" : settings.cssExtnames,
    "cleanStacks" : settings.cleanStacks,
    "autoprefixer": settings.autoprefixer,


    // appstack paths
    "public"   : path.join(base_path, settings.public),
    "views"    : path.join(base_path, settings.views),
    "js"       : path.join(base_path, settings.public, settings.js),
    "snippet"  : path.join(base_path, settings.views, settings.snippet),
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
    "excludes"   : utils.extnameReg(settings.excludes, 'i'),
    "distLimit"  : settings.distLimit,

    // appbuild paths
    "distPublic" : path.join(base_path, settings.distPublic),
    "distViews"  : path.join(base_path, settings.distViews)
  };

  extend(this, props);
}