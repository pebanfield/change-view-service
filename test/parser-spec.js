/**
 * parser-spec
 */
var assert = require("assert");
var parser = require("../src/parser");

describe('node-git parser', function(){

  describe('getHistory', function(done){

    it('should return a git log history as a json object', function(done){

      parser.getHistory().then(function(commits){
        assert.ok(commits);
        done();
      });
    });

    it('should return single commit json objects with latest first', function(done){

      parser.getHistory().then(function(commits){

        var commitOne = commits[0];

        assert.equal(commitOne.revision, '80d2d5bd3bb75cd7978caf1cebba5d6264b72dcd');
        done();
      });
    });

    it('should return commit entry status', function(done){

      parser.getHistory().then(function(commits){

        var commitOne = commits[0];
        var commitTwo = commits[2];
        assert.equal(commitOne.entries[0].status, 'added');
        assert.equal(commitTwo.entries[1].status, 'deleted');
        done();
      });
    });

    it('should return a file size property', function(done){

      parser.getHistory().then(function(commits){

        var commitThree = commits[3];
        assert.ok(commitThree.entries[0].size);
        done();
      });
    });

    it('should return directory entry', function(done){

      parser.getHistory().then(function(commits){

        var commitFive = commits[5];
        var subdirectory = commitFive.entries[2];
        assert.equal(subdirectory.name, 'subdirectory');
        done();
      });
    });

    it('should return a package file', function(done){

      parser.getHistory().then(function(commits){

        var commitFive = commits[5];
        var subdirectory = commitFive.entries[2];
        var packageFile = subdirectory.entries[0];
        assert.equal(subdirectory.name, 'subdirectory');
        assert.equal(packageFile.name, 'subfileone.js');
        done();
      });
    });

  })
});