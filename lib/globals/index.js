

require('./native');

exports.config = require('./config');

// send the config via global for transformers which are resolved/called by
// browserify automatically, since I have no idea to send config to them right now
global.appstackr = {
  // the config required by transforms npm module
  imgDir: exports.config.img,
  exts: exports.config.moveExtnames
};