var fs = require('fs');
var path = require('path'),
    basename = path.basename,
    join = path.join;
var util = require('util'),
    inspect = util.inspect;

var expect = require('expect.js');
var browserify = require('browserify');
var through = require('through');
var colors = require('colors');

/// testenv should always be the first local imported module to set up test env
var testenv = require('./testenv');
var transforms = require('../lib/transforms');
var ractive = require('../lib/transforms/ractive');
var text = require('../lib/transforms/text');





describe('transforms', function() {

  describe('text.js', function () {

    it('should transform template file for browserify', function (done) {

      var b = browserify(join(__dirname, 'fixtures', 'files', 'entry-double-quote-str.js'));
      b.transform(function (file) {
        if (basename(file) != 'double-quote-str.swig') return through();
        return text({});
      });

      b.bundle(done);

    });

    it('should return the string to require', function(done) {
      var tr = text({});
      var mod = {};
      var data = [];

      tr.on('data', function (chunk) {
        data.push(chunk);
      });

      tr.on('end', function () {
        data = Buffer.concat(data).toString('utf8');

        try {
          Function('module', data)(mod);
          expect(mod.exports).to.be('\"; double quote string ended');
          done();

        } catch (err) { done(err)}

      });

      fs.createReadStream(join(__dirname, 'fixtures', 'files', 'double-quote-str.swig')).pipe(tr);
    })

  });
});