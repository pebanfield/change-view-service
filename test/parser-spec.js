/**
 * parser-spec
 */
var assert = require("assert");
var parser = require("../src/parser");

describe('node-git parser', function(){

  describe('getHistory', function(){

    it('should return a git log history as a json object', function(done){

      parser.getHistory('test/data/').then(function(commits){
        assert.ok(commits);
        done();
      }).catch(done);
    });

    it('should return single commit json objects with latest first', function(done){

      parser.getHistory('test/data/').then(function(commits){

        var commitOne = commits[0];

        assert.equal(commitOne.revision, '80d2d5bd3bb75cd7978caf1cebba5d6264b72dcd');
        done();
      }).catch(done);
    });

    it('should return commit entry status', function(done){

      parser.getHistory('test/data/').then(function(commits){

        var commitOne = commits[0];
        var commitTwo = commits[1];
        assert.equal(commitOne.entries[0].status, 'added');
        assert.equal(commitTwo.entries[1].status, 'modified');
        done();
      }).catch(done);
    });

    it('should return a file size property', function(done){

      parser.getHistory('test/data/').then(function(commits){

        var commitThree = commits[3];
        assert.ok(commitThree.entries[0].size);
        done();
      }).catch(done);
    });

    it('should return directory entry', function(done){

      parser.getHistory('test/data/').then(function(commits){

        var commitFive = commits[5];
        var subdirectory = commitFive.entries[2];
        assert.equal(subdirectory.name, 'subdirectory');
        done();
      }).catch(done);
    });

    it('should return a nested package file', function(done){

      parser.getHistory('test/data/').then(function(commits){

        var commitFive = commits[5];
        var subdirectory = commitFive.entries[2];
        var packageFile = subdirectory.entries[0];
        assert.equal(subdirectory.name, 'subdirectory');
        assert.equal(packageFile.name, 'subfileone.js');
        done();
      }).catch(done);
    });

    it('should return status for a nested package file', function(done){

      parser.getHistory('test/data/').then(function(commits){

        var commitFive = commits[5];
        var subdirectory = commitFive.entries[2];
        var packageFile = subdirectory.entries[0];
        assert.equal(packageFile.status, 'added');
        done();
      }).catch(done);
    });

    it('should return status for a nested package package', function(done){

      parser.getHistory('test/data/').then(function(commits){

        var commitFive = commits[6];
        var subdirectory = commitFive.entries[2];
        var subofsub = subdirectory.entries[1];
        var subfileone = subofsub.entries[0];
        var subfiletwo = subofsub.entries[1];
        assert.equal(subfileone.name, 'newfile.js');
        assert.equal(subfiletwo.name, 'newfiletwo.js');
        done();
      }).catch(done);
    });

    it('should return branch history', function(done){

      parser.getHistory('test/data/', 'branch_one').then(function(commits){

        var commitEight = commits[8];
        var subdirectory = commitEight.entries[2];
        var subofsub = subdirectory.entries[1];
        var subfileone = subofsub.entries[0];
        assert.equal(subfileone.name, 'newfile.js');
        done();
      }).catch(done);
    });

  })
});