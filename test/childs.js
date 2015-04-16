var fs = require('fs');
var path = require('path'),
    join = path.join;

var expect = require('expect.js');
var childs = require('../lib/childs');
var support = require('./support'),
    config = support.config;

describe('childs', function() {

  describe('error handling', function() {

    it('should callback error if child process send message in Error type', function(done) {

      childs.options({modulename: 'uglifyjs.js', config: config})
        .run(fs.readFileSync(join(__dirname, 'fixtures', 'files', 'broken-codes.js'), 'utf8'), function(err) {
          expect(err).to.be.an('object');
          expect(err).to.have.property('message');
          done();
        });
    })
  })
});
