/**
 * User: benpptung
 * Date: 2014/2/4
 * Time: PM8:16
 */



var path = require('path'),
    base_path = path.join(__dirname, 'site');

process.chdir(base_path);

var profile = require('../lib/profile');

describe('profile', function () {

  it('should bind properties found on the process.cwd() directory', function () {
    profile.cdn.should.be.equal('//s3.icartoon.me/');
    profile.srcmapUrl.should.be.equal('http://localhost:3000');
    profile.warning.should.be.true;
    profile.reserved.should.be.an.Array.and.have.length(0);
    profile.beautify.should.be.false;
    profile.public.should.be.equal(path.join(base_path, 'public'));
    profile.views.should.be.equal(path.join(base_path, 'views'));
    profile.js.should.be.equal(path.join(base_path, 'public', 'js'));
    profile.snippet.should.be.equal(path.join(base_path, 'views', 'snippet'));
    profile.css.should.be.equal(path.join(base_path, 'public', 'css'));
    profile.img.should.be.equal(path.join(base_path, 'public', 'img'));
    profile.asset.should.be.equal(path.join(base_path, 'public', 'asset'));
    profile.src.should.be.equal(path.join(base_path, 'public', 'src'));
    profile.distPublic.should.be.equal(path.join(base_path, 'dist', 'public'));
    profile.distViews.should.be.equal(path.join(base_path, 'dist', 'views'));
  });

  it('profile will keep the same even if required again', function () {
    profile.cdn.should.be.equal('//s3.icartoon.me/');
    profile.srcmapUrl.should.be.equal('http://localhost:3000');
    profile.warning.should.be.true;
    profile.reserved.should.be.an.Array.and.have.length(0);
    profile.beautify.should.be.false;
    profile.public.should.be.equal(path.join(base_path, 'public'));
    profile.views.should.be.equal(path.join(base_path, 'views'));
    profile.js.should.be.equal(path.join(base_path, 'public', 'js'));
    profile.snippet.should.be.equal(path.join(base_path, 'views', 'snippet'));
    profile.css.should.be.equal(path.join(base_path, 'public', 'css'));
    profile.img.should.be.equal(path.join(base_path, 'public', 'img'));
    profile.asset.should.be.equal(path.join(base_path, 'public', 'asset'));
    profile.src.should.be.equal(path.join(base_path, 'public', 'src'));
    profile.distPublic.should.be.equal(path.join(base_path, 'dist', 'public'));
    profile.distViews.should.be.equal(path.join(base_path, 'dist', 'views'));
  })

  it('property beautify is writable initially', function () {
    profile.beautify = true;
    profile.beautify.should.be.true;
  });
})