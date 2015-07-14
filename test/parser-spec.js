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
        commits.reverse();
        var commitOne = commits[0];

        assert.equal(commitOne.revision, '80d2d5bd3bb75cd7978caf1cebba5d6264b72dcd');
        done();
      });
    });

    it('should return commit entry status', function(done){

      parser.getHistory().then(function(commits){

        var commitOne = commits[0];
        var commitTwo = commits[1];
        assert.equal(commitOne.entries[0].status, 'added');
        assert.equal(commitTwo.entries[1].status, 'deleted');
        done();
      });
    });

  })
});