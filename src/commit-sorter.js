/**
 * revision-sorter
 */

var ADD_ENTRY_TYPE = 350;
//TODO - compare against size of previous revision
var DELETE_ENTRY_TYPE = 100;
var MODIFY_ENTRY_TYPE = 200;
var REPLACE_ENTRY_TYPE = 200;

//Weighting multiples
var FILE_SIZE_CHANGE_MUTLIPLE = 1;
//calculated as percentage
//var PERCENTAGE_FILE_SIZE_CHANGE_MUTLIPLE = 3;

var NUMBER_OF_AUTHORS_MUTLIPLE = 150;
var NUMBER_OF_COMMITS_MUTLIPLE = 75;
var NUMBER_OF_PATH_CHANGES_MUTLIPLE = 10;

var api = {sort: _sort};

function _sort(commits){

}
