/**
 * User: benpptung
 * Date: 2014/2/7
 * Time: PM7:03
 */
var expect = require('expect.js');

var testenv = require('./testenv'),
    config = testenv.config;
var dirprop = require('../lib/dirprop');

describe('dirprop()', function(){

  it('should have correct dir props of js dir', function(){
    var jsDirProp = dirprop('js');

    expect(jsDirProp.addhash).to.be(true);
    expect(jsDirProp.refactor).to.be(true);
    expect(jsDirProp.htmlmini).to.be(false);
    expect(jsDirProp.distDirPath).to.be.eql(config.distPublic);
  });


  describe('#dirs', function(){
    it('should have length 5', function(){
      expect(dirprop.dirs).to.have.length(5);
    });
    it('should contain views, js, css, img, and asset string', function(){

      expect(dirprop.dirs).to.be.eql(['views', 'js', 'css', 'img', 'asset']);
    })
  });

  describe('#distfiles()', function(){
    it('return files according to directory key', function(done){

      dirprop.distfiles('views', function(err, distfiles){
        expect(distfiles).to.have.length(4);
        done();
      })
    })
  });
});