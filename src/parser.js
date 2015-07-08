/**
 * app
 */
"use strict";

var nodegit = require("nodegit");
var Promise = require('bluebird');

var api = {getHistory: _getHistory};

function _getHistory(){

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
        console.log("commit")
      });

      history.on('end', function(commits){
        console.log("commits");
        //how do resolve this?
        resolver.resolve(commits);
      });

      // Start emitting events.
      history.start();

      return resolver.promise;
    });
}

module.exports = api;