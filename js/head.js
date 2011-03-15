/****************************/
/* Head class - let's think */
/****************************/

function Head(){
	this.filmName = '';
	this.memory = null; //variable to hold the JSON to be rendered
	this.simpleTree = null;
	this.nose = null;
	this.IQ = 3;
	this.thoughts = 0;
}
Head.prototype.setUp = function(name){
	this.filmName = name;
}
Head.prototype.think = function(){
	//Here we analyse our "Memory" to find if we can push data further
	console.log('thinking...');
	console.log(this.memory);
	
	if(this.thoughts > this.IQ){ 
		console.log('Wow! too much thinking out there...starting to burn!');
	}
	this.thoughts += 1;
	
	var self = this;
	(function loopMemory(obj) {
		var newKey;
		var newValue;
		for (var key in obj) {
	    if (typeof(obj[key]) == 'object') {
	      loopMemory(obj[key]);
	    } else {
	      if(obj[key] != true){
					//If the value is set to true, it means this key/value has already 
					//been taken care of. Otherwise, let's process and explore further
					var nextStep = self.match(obj[key]);
					if(nextStep && self.thoughts <= self.IQ){
						//If we find a match, let's explore that
						newValue = obj[key];
						newKey = key;
						delete obj[key];
						obj[newKey + ': ' + newValue] = 'pending'; //For further processing. Once the data is fetched, we will fix this value
						
						console.log('No following ' + nextStep['urlToFetch']);
						self.nose.follow(nextStep['urlToFetch'], nextStep['typeOfData'],nextStep['pathToFollow']);
					
					} else{
						//Case of a regular value. Let's trick the key, and set the value to true
						newValue = obj[key];
						newKey = key;
						delete obj[key];
						obj[newKey + ': ' + newValue] = true;
						console.log('just created key ' + newKey + ' and value ' + newValue);
					}
					
				}	else { console.log('Nothing to do :)')}
	    }
	  }
	})(self.memory);
}
Head.prototype.match = function(dataToMatch){
	var semanticMatching = {
		// %% = placeholder for matched IDs
		'^http:\/\/www\.freebase\.com\/view\/en\/(.{1,})$': 
				['http://www.freebase.com/experimental/topic/standard/en/%%','jsonp',['result','webpage']],
		'^http:\/\/www\.freebase\.com\/view\/m\/([0-9a-z]{1,})$': 
				['http://www.freebase.com/experimental/topic/standard/m/%%','jsonp',['result','webpage']],
		'^http:\/\/mb-redir\.freebaseapps\.com\/redir\/([0-9a-z-]{1,})$':
				['http://mm.musicbrainz.org/ws/1/release-group/%%.html?type=xml&inc=releases','xml',['query','results','metadata','release-group','release-list','release']],
		'^([0-9a-z-]{10,})$':
				['http://mm.musicbrainz.org/ws/1/release/%%?type=xml&inc=artist+counts+release-events+discs+tracks','xml',['query','results','metadata','release','track-list']]
	};
	for (var key in semanticMatching){
		//check Regex and make our nose follow the right direction
		var regex = new RegExp(key,'g');
		console.log(regex.source);
		var match = regex.exec(dataToMatch);
		if(match){ 
			var urlToFetch = semanticMatching[key][0].replace('%%',match[1]);
			var typeOfData = semanticMatching[key][1];
			var pathToFollow = semanticMatching[key][2];
			return {'urlToFetch': urlToFetch, 'typeOfData': typeOfData, 'pathToFollow': pathToFollow};
		}
	}
	console.log('no match found for '+ dataToMatch);
	return false;
}
Head.prototype.format = function(){
	//Function to format the memory for a nicer display to the user
	var self = this;
	console.log('begin formatting');
	console.log(this.memory);
	self.simpleTree = self.memory;
	(function loopThroughJSON(obj) {
	  var newKey;
		var newValue;
		for (var key in obj) {
	    if (typeof(obj[key]) == 'object') {
	      loopThroughJSON(obj[key]);
	    } else {
				var isINT = new RegExp('^[0-9]{1,3}$','g');
				if(isINT.test(key)){
					key = obj[key];
					console.log('getting rid of key' + key);
				}
				var isCryptic = new RegExp('^id:.{1,}$','g');
				if(isCryptic.test(key)){
					console.log('getting rid of key' + key);
					delete obj[key];
				}
	    }
	  }
	})(self.simpleTree);
}
Head.prototype.memorize = function(data){
	var self = this;
	
	if(this.memory == null){
		this.memory = data;
	} else {
		//the memory is not empty. It should have a "Insertion point" labeled "pending"
		(function loopMemory(obj) {
			var newKey;
			var newValue;
			for (var key in obj) {
		    if (typeof(obj[key]) == 'object') {
		      loopMemory(obj[key]);
		    } else {
		      if(obj[key] == 'pending'){
						obj[key] = data;
					}
		    }
		  }
		})(self.memory);
	}
}
