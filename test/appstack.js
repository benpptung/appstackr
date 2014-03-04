/**
 * Date: 2014/2/9
 * Time: PM5:29
 */
var profile = require('./support'),
    appstack = require('../lib/appstack'),
    tasklist = require('../lib/tasklist'),
    utils = require('../lib/utils'),
    sinon = require('sinon'),
    path = require('path');

var sandbox;

describe('appstack', function () {

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sandbox.stub(tasklist, 'addTask', function (task, callback) {
      callback();
    });
    sandbox.stub(tasklist, 'run', function (filter, callback) {
      if (typeof filter == 'function') callback = filter;
      callback();
    });
  });

  afterEach(function () {
    sandbox.restore();
  })

  describe('#stack()', function () {
    it('accept option beautify before profile freeze', function (done) {
      sandbox.stub(console, 'log');
      sandbox.stub(tasklist, 'rawStacks', function (stacksfile, callback) {
        var stacks = require(path.join(__dirname, 'fixtures', 'appstack', 'validstacks', 'stacksfile.js'));
        callback(null, stacks);
      });
      // set profile before freeze
      appstack.stack({ beautify: true, warning: false, other: true}, function (err) {
        profile.beautify.should.be.true;
        profile.warning.should.be.false;
        sinon.assert.callCount(tasklist.addTask, 6);
        sinon.assert.calledOnce(tasklist.run);

        // restore profile properties for following tests
        profile.beautify = false;
        profile.warning = true;
        console.log.restore(); // restore should be earlier than done()
        done();
      });
    });
  });

  describe('#build()', function () {
    it('take options, final tasklist and call appbuild()', function (done) {
      var messages = [];

      sandbox.stub(tasklist, 'rawStacks', function (stacksfile, callback) { callback(null, []) });
      sandbox.stub(utils, 'log', function (message) { messages.push(message); });

      appstack.build(function () {
        utils.clean('build', function () {
          messages.should.containEql('building successful.');
          done();
        })
      });
    });
  })
});