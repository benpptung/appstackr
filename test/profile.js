/**
 * User: benpptung
 * Date: 2014/2/4
 * Time: PM8:16
 */



var path = require('path'),
    base_path = path.join(__dirname, 'site');

process.chdir(base_path);

var profile = require('../lib/globals/config');

describe('profile', function () {

  it('should bind properties found on the process.cwd() directory', function () {
    config.cdn.should.be.equal('//s3.icartoon.me/');
    config.srcmapUrl.should.be.equal('http://localhost:3000');
    config.warning.should.be.true;
    config.reserved.should.be.an.Array.and.have.length(0);
    config.beautify.should.be.false;
    config.public.should.be.equal(path.join(base_path, 'public'));
    config.views.should.be.equal(path.join(base_path, 'views'));
    config.js.should.be.equal(path.join(base_path, 'public', 'js'));
    config.snippet.should.be.equal(path.join(base_path, 'views', 'snippet'));
    config.css.should.be.equal(path.join(base_path, 'public', 'css'));
    config.img.should.be.equal(path.join(base_path, 'public', 'img'));
    config.asset.should.be.equal(path.join(base_path, 'public', 'asset'));
    config.src.should.be.equal(path.join(base_path, 'public', 'src'));
    config.distPublic.should.be.equal(path.join(base_path, 'dist', 'public'));
    config.distViews.should.be.equal(path.join(base_path, 'dist', 'views'));
  });

  it('profile will keep the same even if required again', function () {
    config.cdn.should.be.equal('//s3.icartoon.me/');
    config.srcmapUrl.should.be.equal('http://localhost:3000');
    config.warning.should.be.true;
    config.reserved.should.be.an.Array.and.have.length(0);
    config.beautify.should.be.false;
    config.public.should.be.equal(path.join(base_path, 'public'));
    config.views.should.be.equal(path.join(base_path, 'views'));
    config.js.should.be.equal(path.join(base_path, 'public', 'js'));
    config.snippet.should.be.equal(path.join(base_path, 'views', 'snippet'));
    config.css.should.be.equal(path.join(base_path, 'public', 'css'));
    config.img.should.be.equal(path.join(base_path, 'public', 'img'));
    config.asset.should.be.equal(path.join(base_path, 'public', 'asset'));
    config.src.should.be.equal(path.join(base_path, 'public', 'src'));
    config.distPublic.should.be.equal(path.join(base_path, 'dist', 'public'));
    config.distViews.should.be.equal(path.join(base_path, 'dist', 'views'));
  })

  it('property beautify is writable initially', function () {
    config.beautify = true;
    config.beautify.should.be.true;
  });
})