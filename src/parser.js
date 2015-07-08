/**
 * app
 */
"use strict";

var nodegit = require("nodegit");

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
      var history = firstCommitOnMaster.history();

      // Listen for commit events from the history.
      history.on('commit', function(commit) {
        console.log("commit")
      });

      history.on('end', function(commits){
        console.log("commits");
        //how do resolve this?
        return commits;
      });

      // Start emitting events.
      history.start();
    });
}

module.exports = api;