/**
 * User: benpptung
 * Date: 2014/2/12
 * Time: PM3:23
 */
var profile = require('./support'),
    appbuild = require('../lib/appbuild'),
    utils = require('../lib/utils'),
    sinon = require(('sinon')),
    sandbox;

describe.skip('appbuild()', function () {

  beforeEach(function(){
    sandbox = sinon.sandbox.create();
  });
  afterEach(function(){
    sandbox.restore();
  });

  it('build files in dist folders', function (done) {
    var messages = [];

    sandbox.stub(utils, 'log', function(message){
      messages.push(message);
    });

    appbuild({tasklist: true}, function () {
      utils.clean('build', function () {
        messages.should.containEql('building successful.');
        messages.should.be.length(9);
        done();
      })
    });
  });
})