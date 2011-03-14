/****************************/
/* Head class - let's think */
/****************************/

function Head(){
	this.filmName = '';
	this.memory = null; //variable to hold the JSON to be rendered
}
Head.prototype.setUp = function(name){
	this.filmName = name;
}
Head.prototype.format = function(data){
	//Function to shift key/values of JSON objects for printing with protovis
	(function loopThroughJSON(obj) {
	  for (var key in obj) {
	    if (typeof(obj[key]) == 'object') {
	      loopThroughJSON(obj[key]);
	    } else {
	      key = obj[key];
	    }
	  }
	})(data);
	this.memory = data;
}
Head.prototype.memorize = function(data){
	this.memory = data;
}
