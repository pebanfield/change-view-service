/**
 * parser-spec
 */
var assert = require("assert");
var parser = require("../src/parser");

describe('node-git parser', function(){

  describe('getHistory', function(done){

    it('should return a git log history', function(done){

      parser.getHistory().then(function(commits){
        console.log(commits);
        done();
      });
    });

  })
});