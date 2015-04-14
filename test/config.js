/**
 * User: benpptung
 * Date: 2014/2/4
 * Time: PM8:16
 */



var path = require('path'),
    join = path.join;



describe.skip('config', function () {

  var cwd = process.cwd();
  var base_path = path.join(__dirname, 'site');
  var config;

  beforeEach(function() {
    process.chdir(base_path);
    config = require('../lib/globals/config');
  });

  afterEach(function() {
    delete require.cache[require.resolve('../lib/globals/config')];
    process.chdir(cwd);
  });

  it('should bind appstackr-settings.json config found on the process.cwd() directory', function () {
    config.cdn.should.be.equal('//s3.icartoon.me/');
    config.srcmapUrl.should.be.equal('http://localhost:3000');
    config.warning.should.be.true;
    config.reserved.should.be.an.Array.and.have.length(0);
    config.beautify.should.be.false;
    config.public.should.be.equal(path.join(base_path, 'public'));
    config.views.should.be.equal(path.join(base_path, 'views'));
    config.js.should.be.equal(path.join(base_path, 'public', 'js'));
    config.components.should.be.equal(path.join(base_path, 'views', 'components'));
    config.css.should.be.equal(path.join(base_path, 'public', 'css'));
    config.img.should.be.equal(path.join(base_path, 'public', 'img'));
    config.asset.should.be.equal(path.join(base_path, 'public', 'asset'));
    config.src.should.be.equal(path.join(base_path, 'public', 'src'));
    config.distPublic.should.be.equal(path.join(base_path, 'dist', 'public'));
    config.distViews.should.be.equal(path.join(base_path, 'dist', 'views'));
  });



});