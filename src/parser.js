/**
 * app
 */
"use strict";

var nodegit = require("nodegit");
var Promise = require('bluebird');

var api = {getHistory: _getHistory};

function _getHistory(){

  var blobTable = {};
  var open = nodegit.Repository.open;

// Open the repository directory.
  return open("/Users/pebanfield/PROJECTS/change-view/change-viewer")
    // Open the master branch.
    .then(function(repo) {
      return repo.getMasterCommit();
    })
    // Display information about commits on master.
    .then(function(firstCommitOnMaster) {
      // Create a new history event emitter.
      var resolver = Promise.defer();
      var history = firstCommitOnMaster.history();

      // Listen for commit events from the history.
      history.on('commit', function(commit) {

      });

      history.on('end', function(commits){

        var responseCommits = [];
        commits.forEach(function(commit){
          var commitObj = {};
          commitObj.author = commit.author().name();
          commitObj.revision = commit.sha();
          commitObj.date = commit.date();
          commitObj.message = commit.message();
          commitObj.entries = [];
          commit.getTree().then(function(tree) {
            // Use treeEntry
            var entries = tree.entries();
            entries.forEach(function(entry){
              var entryObj = {};
              if(entry.isFile()){
                entry.getBlob().then(function(blob){
                  entryObj.size = blob.rawsize();
                  entryObj.date = commit.date();
                  entryObj.kind = 'file';
                });
              } else {
                entryObj.kind = 'tree';
              }
              entryObj.path = entry.path();
              var nameArray = entry.path().split("/");
              entryObj.name = nameArray[nameArray.length-1];
              entryObj.time = commit.date();
              entryObj.author = commit.author().name();
              commitObj.entries.push(entryObj);
            });
          });
          responseCommits.push(commitObj);
        });

        resolver.resolve(responseCommits);
      });

      // Start emitting events.
      history.start();

      return resolver.promise;
    });
}

module.exports = api;