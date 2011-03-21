/**************************************/
/* TreeBuilder -- let's build a tree! */
/**************************************/

function TreeBuilder(filmName, dataFetcher){
	this.root = filmName;
	this.dataFetcher = dataFetcher;
	this.content = new Object();
	this.simpleTree = new Object();
	this.progress = 0;
	this.activity = 'Starting block';
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
				
				this.progress = 25;
				this.activity = 'Searching for realease-group links...';
				
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
				
				this.progress = 50;
				this.activity = 'Searching a MusicBrainz release...';
				
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
				
				this.progress = 75;
				this.activity = 'Yay! Found it! Sucking data...';
				
				break;
				
			case 'tracks':
				
				//Formatting duration of songs & removing (possible) artist data
				for(var i=0; i<result.data.track.length; i++){
					var duration = result.data.track[i].duration;
					var min = Math.floor((duration/1000)/60); //Duration is given in millisec
					var sec = Math.floor( Math.floor(duration/1000) - min*60);
					var humanReadableDuration = min+"' "+sec+"s";
					result.data.track[i].duration = humanReadableDuration;
					
					if(result.data.track[i].artist){
						delete result.data.track[i].artist;
					}
				}
				
				insertionPoint[result.type] = result.data.track;
				console.log('inserting tracks');
				console.log(result.data);
				
				//little bit of cleaning here -- data we don't need to print
				delete this.content.soundtracks['release-group link']['release-group'].id;
				delete this.content.soundtracks['release-group link']['release-group'].asin;
				delete this.content.soundtracks['release-group link']['release-group']['track-list'];
				
				this.dataFetcher.stop();
				this.progress = 100;
				this.activity = 'Tracks found! Will now sleep for a while... :)';
				console.log('Just stopped the dataFetcher & semanticDealer, cause we got our tracks :)')
				
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

TreeBuilder.prototype.computeSimpleTree = function(){
	this.simpleTree['tracks'] = this.content.soundtracks['release-group link']['release-group'].tracks;
}

