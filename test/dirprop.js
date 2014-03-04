/**
 * User: benpptung
 * Date: 2014/2/7
 * Time: PM7:03
 */

var profile = require('./support'),
    dirprop = require('../lib/dirprop');

describe('dirprop()', function(){

  it('should have correct dir props of js dir', function(){
    var jsDirProp = dirprop('js');

    jsDirProp.addhash.should.be.true;
    jsDirProp.refactor.should.be.false;
    jsDirProp.htmlmini.should.be.false;
    jsDirProp.distDirPath.should.be.equal(profile.distPublic);
  })


  describe('#dirs', function(){
    it('should have length 5', function(){
      dirprop.dirs.should.have.length(5);
    });
    it('should contain views, js, css, img, and asset string', function(){
      dirprop.dirs.should.containEql('views');
      dirprop.dirs.should.containEql('js');
      dirprop.dirs.should.containEql('css');
      dirprop.dirs.should.containEql('img');
      dirprop.dirs.should.containEql('asset');
    })
  })

  describe('#distfiles()', function(){
    it('return files according to directory key', function(done){

      dirprop.distfiles('views', function(err, distfiles){
        distfiles.should.have.length(4);
        done();
      })
    })
  })
})