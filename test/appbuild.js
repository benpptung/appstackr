/**
 * User: benpptung
 * Date: 2014/2/12
 * Time: PM3:23
 */

var expect = require('expect.js');

var testenv = require('./testenv'),
    config = testenv.config;
var appbuild = require('../lib/appbuild');
var utils = require('../lib/utils');

describe('appbuild()', function () {

  var _messages = [];
  var _message;
  var _warning;

  beforeEach(function() {
    _messages = [];
    utils.message = function(message) {
      _messages.push(message);
    };
    config.warning = true;
  });

  afterEach(function() {
    utils.message = _message;
    config.warning = _warning;
  });


  it('build files in dist folders', function (done) {

    appbuild(function () {
      utils.clean('build', function () {
        expect(_messages).contain('building successful.');
        expect(_messages).to.have.length(9);
        done();
      })
    });
  });
})