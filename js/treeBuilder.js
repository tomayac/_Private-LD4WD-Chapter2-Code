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
	var result = this.retrieve(requestId);
	var insertionPoint = this.findInsertionPoint(requestId);
	switch(result.type){
			
			case 'soundtracks':
				insertionPoint[result.type] = result.data[0];
				//delete the insertion point token
				delete this.content[this.filmName];
				break;
				
			case 'release-group link':
				for(var i=0; i<result.data.length; i++){
					if(result.data[i].text == 'MusicBrainz' ){
						insertionPoint[result.type] = result.data[i];
						console.log('integrated, yay');
					}
				}
				//delete the insertion point token
				delete this.content.soundtracks.url;
				break;
				
			case 'release-group':
				if(result.data[0]){
					//Several release-group -- e.g., Fight Club
					delete result.data[0]['text-representation'];
					insertionPoint[result.type] = result.data[0];
				}
				else{
					//Only one release-group -- e.g., The Big Lebowsky
					delete result.data['text-representation'];
					insertionPoint[result.type] = result.data;
				}
				//delete the insertion point token
				delete this.content.soundtracks['release-group link'].url;
				break;
				
			case 'tracks':
				insertionPoint[result.type] = result.data;
				console.log('inserting tracks');
				console.log(result.data);
				//delete the insertion point token
				//delete this.content.soundtracks['release-group link'].url;
				break;
				
			default:
				console.error('type is not among the type supported!');
				insertionPoint[requestId] = result.data;
				insertionPoint['type'] = result.type;
	}
	
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

