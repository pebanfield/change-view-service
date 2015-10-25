/**
 * revision-sorter
 */

var ADD_ENTRY_TYPE = 350;
//TODO - compare against size of previous revision
var DELETE_ENTRY_TYPE = 100;
var MODIFY_ENTRY_TYPE = 200;
var REPLACE_ENTRY_TYPE = 200;

//Weighting multiples
var FILE_CHANGE_VALUE = 1.15;
var DIRECTORY_CHANGE_VALUE = 1;
var FILE_SIZE_CHANGE_MUTLIPLE = 1;
var PERCENTAGE_FILE_SIZE_CHANGE_MUTLIPLE = 3;
var NUMBER_OF_AUTHORS_MUTLIPLE = 150;
var NUMBER_OF_COMMITS_MUTLIPLE = 75;
var NUMBER_OF_PATH_CHANGES_MUTLIPLE = 10;

var api = {sort: _sort};

function _sort(commits){

  commits.forEach(function(commit){
    commit.entries.map(_setSignificance);
  });
}

function _setSignificance(entryObj){


  entryObj.significance =
    _getTypeValue(entryObj.type) +
    entryObj.size * FILE_SIZE_CHANGE_MUTLIPLE +
    entryObj.pathHistory.length() * NUMBER_OF_PATH_CHANGES_MUTLIPLE +
    entryObj.authors.length() * NUMBER_OF_AUTHORS_MUTLIPLE +
    entryObj.commitTotal * NUMBER_OF_COMMITS_MUTLIPLE;


  if(entryObj.type == 'file'){
    entryObj.size = entryObj.size * FILE_CHANGE_VALUE;
  } else {
    entryObj.size = entryObj.size * DIRECTORY_CHANGE_VALUE;
  }

}

function _getTypeValue(type){

  var val = 0;
  switch(type){
    case ADD_ENTRY_TYPE :
      val = ADD_ENTRY_TYPE;
      break;
    case DELETE_ENTRY_TYPE :
      val = DELETE_ENTRY_TYPE;
      break;
    case MODIFY_ENTRY_TYPE :
      val = MODIFY_ENTRY_TYPE;
      break;
    case REPLACE_ENTRY_TYPE :
      val = REPLACE_ENTRY_TYPE;
      break;
  }

  return val;
}

module.exports = api;
