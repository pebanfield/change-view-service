/**
 * app
 */
"use strict";

var nodegit = require("nodegit");
var Promise = require('bluebird');

var api = {getHistory: _getHistory};

function _getHistory(){

  var entryTable = {};
  var open = nodegit.Repository.open;

// Open the repository directory.
  return open("test/data")
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
        var commitTreeCalls = [];

        commits.forEach(function(commit){

          var commitObj = {};
          commitObj.author = commit.author().name();
          commitObj.revision = commit.sha();
          commitObj.date = commit.date();
          commitObj.message = commit.message();
          commitObj.entries = [];
          commitTreeCalls.push(commit.getTree());
          responseCommits.push(commitObj);
        });

        Promise.all(commitTreeCalls).then(function(commitTrees){

          commitTrees.forEach(function(commitTree, commitIndex){

            var entries = commitTree.entries();

            entries.forEach(function(entry, entryIndex){
              var entryObj = {};
              try {
                entryObj.path = entry.path();
                var nameArray = entry.path().split("/");
                entryObj.name = nameArray[nameArray.length-1];
                entryObj.author = responseCommits[commitIndex].author;
                entryObj.date = responseCommits[commitIndex].date;
              } catch(error) {
                console.log("error : " + error);
              }

              if(entry.isFile()){

                entry.getBlob().then(function(blob){

                  try {
                    entryObj.size = blob.rawsize();
                    entryObj.kind = 'file';
                    entryObj.mode = blob.filemode();
                  } catch(error){
                    console.log("error : " + error);
                  }
                  if(entryIndex === entries.length-1 && commitIndex === commitTrees.length-1){

                    responseCommits.reverse(); //prints history with the most recent commit last
                    _setStatus(responseCommits, entryTable);
                    resolver.resolve(responseCommits);
                  }
                });
              } else {
                entryObj.kind = 'tree';
              }

              responseCommits[commitIndex].entries.push(entryObj);
            });

          });

        });
      });

      // Start emitting events.
      history.start();

      return resolver.promise;
    });
}

function _setStatus(commits, entryTable){

  commits.forEach(function(commit){

    commit.entries.forEach(function(entry){

      var previousEntry = entryTable[entry.path];
      if(previousEntry){

        if(entry.date != previousEntry.date){
          entry.status = 'modified';
        }
      } else {
        entry.status = 'added';
        entryTable[entry.path] = entry;
      }

    });
    //identify deleted entries
    for (var property in entryTable) {
      if (entryTable.hasOwnProperty(property)) {
        var exists = false;
        var currentEntry = null;
        commit.entries.forEach(function(entry){
          currentEntry = entry;
          if(entry.path === entryTable[property].path){
            exists = true;
          }
        });
        if(!exists){
          entryTable[property].status = 'deleted';
          commit.entries.push(entryTable[property]);
          delete entryTable[property];
        }
      }
    }
  });
}

module.exports = api;