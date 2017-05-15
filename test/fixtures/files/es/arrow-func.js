'use strict';

const fn = function(done) {
  setTimeout(_=> {
    done(null, 3);
  }, 1000);
};

module.exports = function() {
  fn(function(err, n) {
    if (err) return console.error(err);
    console.log(n);
  });
}

