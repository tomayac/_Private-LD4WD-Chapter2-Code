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
Head.prototype.think = function(){
	//Here we analyse our "Memory" to find if we can push data further
	var self = this;
	(function loopMemory(obj) {
		for (var key in obj) {
	    if (typeof(obj[key]) == 'object') {
	      loopMemory(obj[key]);
	    } else {
	      if(obj[key] != true){
					//If the value is set to true, it means this key/value has already 
					//been taken care of. Otherwise, let's process and explore further
					self.match(obj[key]);
				}
	    }
	  }
	})(this.memory);
}
Head.prototype.match = function(){
	var semanticMatching = [
		// %% = placeholder for IDs
		'/^http:\/\/www\.freebase\.com\/view\/en\/([0-9a-z]{1,})$/', ['http://www.freebase.com/experimental/topic/standard/en/%%','jsonp',['result','webpage']],
		'/^http:\/\/www\.freebase\.com\/view\/m\/([0-9a-z]{1,})$/', ['http://www.freebase.com/experimental/topic/standard/m/%%','jsonp',['result','webpage']]
	];
	for (var key in semanticMatching){
		//check Regex and make our nose follow the right direction
	}
}
Head.prototype.format = function(data){
	//Function to shift key/values of JSON objects for printing with protovis
	(function loopThroughJSON(obj) {
	  var newKey;
		var newValue;
		for (var key in obj) {
	    if (typeof(obj[key]) == 'object') {
	      loopThroughJSON(obj[key]);
	    } else {
	      newValue = obj[key];
				newKey = key;
				delete obj[key];
				obj[newKey + ': ' + newValue] = true;
	    }
	  }
	})(data);
	this.memorize(data);
	return data;
}
Head.prototype.memorize = function(data){
	this.memory = data;
}
