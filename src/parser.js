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

        Promise.all(commits.map(_parseCommit)).then(function(responseCommits){

          responseCommits.reverse(); //prints history with the most recent commit last
          _setStatus(responseCommits, entryTable);
          resolver.resolve(responseCommits);
        });
      });

      // Start emitting events.
      history.start();

      return resolver.promise;
    });
}

function _parseCommit(commit){

  var commitObj = {};
  commitObj.author = commit.author().name();
  commitObj.revision = commit.sha();
  commitObj.date = commit.date();
  commitObj.message = commit.message();

  return new Promise(function(resolve){ setTimeout(function(){

    commit.getTree().then(function(tree){

      Promise.all(tree.entries().map(_parseEntry)).then(function(entries){

        entries.forEach(function(entry){
          entry.author = commitObj.author;
          entry.date = commitObj.date;
        });
        commitObj.entries = entries;
        resolve(commitObj);
      });
    });

  }, 500)});
}

function _parseEntry(entry){

  var entryObj = {};
  try {
    entryObj.path = entry.path();
    var nameArray = entry.path().split("/");
    entryObj.name = nameArray[nameArray.length-1];
    entryObj.sha = entry.sha();
  } catch(error) {
    console.log("error : " + error);
  }

  if(entry.isFile()){

    return new Promise(function(resolve){ setTimeout(function(){

      entry.getBlob().then(function(blob){

        try {
          entryObj.size = blob.rawsize();
          entryObj.kind = 'file';
          entryObj.mode = blob.filemode();
        } catch(error){
          console.log("error : " + error);
        }
        resolve(entryObj);
      });
    }, 500)});

  } else {

    entryObj.kind = 'tree';
    return entry.getTree().then(function(tree) {
      return new Promise(function(resolve){ setTimeout(function(){

        Promise.all(tree.entries().map(_parseEntry)).then(function(entries){

          entryObj.entries = entries;
          resolve(entryObj);
        });
      }, 500)});
    });
  }

}

function _setStatus(commits, entryTable){

  commits.forEach(function(commit){

    commit.entries.forEach(function(entry){

      var previousEntry = entryTable[entry.path];
      if(previousEntry){

        if(entry.sha != previousEntry.sha){
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