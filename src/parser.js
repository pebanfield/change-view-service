/**
 * parses and returns a JSON git history collection.
 */
"use strict";

var nodegit = require("nodegit");
var Promise = require('bluebird');

var api = {getHistory: _getHistory};
var entryTable;

function _getHistory(repo_path, branch_name){

  entryTable = {};
  var open = nodegit.Repository.open;

  return open(repo_path)

    .then(function(repo) {

      if(branch_name){
        return repo.getBranchCommit(branch_name);
      } else {
        return repo.getMasterCommit();
      }
    })
    .then(function(firstCommitOnMaster) {

      var resolver = Promise.defer(); //used to deal with emitter .on('end'
      var history = firstCommitOnMaster.history();

      history.on('end', function(commits){

        Promise.all(commits.map(_parseCommit)).then(function(responseCommits){

          responseCommits.reverse(); //prints history with the most recent commit last
          resolver.resolve(responseCommits);
        })
        .catch(function(error){
          console.log('Error : ' + error.message);
        });
      });

      history.start();

      return resolver.promise;
    });
}

function _parseCommit(commit){

  var commitObj = {};
  try {
    commitObj.author = commit.author().name();
    commitObj.revision = commit.sha();
    commitObj.date = commit.date();
    commitObj.time = new Date(commit.date()).getTime();
    commitObj.message = commit.message();
  } catch(error) {
    console.log("error : " + error);
  }

  return commit.getTree().then(function(tree){

      return Promise.all(tree.entries().map(_parseEntry)).then(function(entries){

        entries.forEach(function(entry){
          entry.author = commitObj.author;
          entry.date = commitObj.date;
          _setStatus(entry, entryTable);
        });
        commitObj.entries = entries;
        return commitObj;
      })
  })
    .catch(function(error){
      console.log('Error : ' + error.message);
  });
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

    return entry.getBlob().then(function(blob){

        entryObj.size = blob.rawsize();
        entryObj.kind = 'file';
        entryObj.mode = blob.filemode();
        return entryObj;
      })
    .catch(function(error){
      console.log('Error : ' + error.message);
    });

  } else {

    entryObj.kind = 'tree';
    return entry.getTree().then(function(tree) {
      return Promise.all(tree.entries().map(_parseEntry)).then(function(entries){

          entryObj.entries = entries;
          return entryObj;
        })
      .catch(function(error){
        console.log('Error : ' + error.message);
      });
    });
  }

}

function _setStatus(entry, entryTable){

  entry.status = 'deleted'; //unidentified entries will be deleted
  var previousEntry = entryTable[entry.path];
  //null check not working because of hierarchy
  if(previousEntry){

    if(entry.sha != previousEntry.sha){
      entry.status = 'modified';
    } else {
      entry.status = 'unchanged';
    }
  } else {
    entry.status = 'added';
    entryTable[entry.path] = entry;
  }
  if(entry.status === 'deleted'){
    delete entryTable[entry.path];
  }

  return entry;
}

module.exports = api;