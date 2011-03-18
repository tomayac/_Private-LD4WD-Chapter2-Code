/**************************************/
/* TreeBuilder -- let's build a tree! */
/**************************************/

function TreeBuilder(filmName, dataFetcher){
	this.root = filmName;
	this.dataFetcher = dataFetcher;
	this.content = new Object();
}

TreeBuilder.prototype.start = function(startUrl){
	var requestId = this.dataFetcher.addToQueue(startUrl, 'jsonp', ['result','properties','/film/film/soundtrack', 'values'],'soundtracks');
	this.content[this.filmName] = requestId;
	this.dataFetcher.start();
}

TreeBuilder.prototype.integrate = function(requestId){
	var data = this.retrieve(requestId);
	var insertionPoint = this.findInsertionPoint(requestId);
	insertionPoint[requestId] = data;
	console.log('Insertion of data done for request #' + requestId);
	return true;
}

TreeBuilder.prototype.retrieve = function(requestId){
	console.log("retrieveing result #" + requestId);
	results = this.dataFetcher.results;
	console.log(results[requestId]);
	return results[requestId];
}

TreeBuilder.prototype.findInsertionPoint = function(requestId){
	console.log('In FindInsertionPoint');
	var self = this;
	var insertionPoint = null;
	(function recursiveTreeLoop(obj) {
		for (var key in obj) {
	    if (typeof(obj[key]) == 'object') {
	      recursiveTreeLoop(obj[key]);
	    } else {
	      if(obj[key] == requestId){
					insertionPoint = obj;
				}
	    }
	  }
	})(self.content);
	console.log('will exit the function in a sec.');
	console.log(insertionPoint);
	return insertionPoint;
	
}
