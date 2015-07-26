/**
 * parses and returns a JSON git history collection.
 */
"use strict";

var nodegit = require("nodegit");
var Promise = require('bluebird');

var api = {getHistory: _getHistory};

function _getHistory(repo_path, branch_name){

  var entryTable = {};
  var open = nodegit.Repository.open;

  return open(repo_path)

    .then(function(repo) {

      if(branch_name){
        repository.getBranch(branch_name);
      } else {
        return repo.getMasterCommit();
      }
    })
    .then(function(firstCommitOnMaster) {

      var resolver = Promise.defer();
      var history = firstCommitOnMaster.history();

      history.on('end', function(commits){

        Promise.all(commits.map(_parseCommit)).then(function(responseCommits){

          responseCommits.reverse(); //prints history with the most recent commit last
          _setStatus(responseCommits, entryTable);
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

function _setStatus(commits, entryTable){

  var addModify = function(entry){

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
      if(entry.status === 'added'){
        entry.status = 'unchanged';
      } else {
        entry.status = 'added';
      }
      entryTable[entry.path] = entry;
      if(entry.kind === 'tree'){

        if(entry.entries && entry.entries.length > 0){
          entry.entries.forEach(function(entry){
            addModify(entry);
          });
        }
      }
    }
  };

  //identify deleted entries and remove
  var removeDeleted = function(entry, entryTable){

    if(entry.status === 'deleted'){
      delete entryTable[entry.path];
    }
  };

  commits.forEach(function(commit) {

    commit.entries.map(addModify);
    commit.entries.map(function(entry) { return removeDeleted(entry, entryTable); });
  });

}

module.exports = api;