/**************************************************************/
/* SemanticDealer -- let's deal with linked data and semantic */
/**************************************************************/

function SemanticDealer(filmName, startUrl){
	this.filmName = filmName;
	this.startUrl = startUrl;
	this.dataFetcher = new DataFetcher();
	this.treeBuilder = new TreeBuilder(filmName, this.dataFetcher);
}
SemanticDealer.prototype.start = function(){
	this.treeBuilder.start(this.startUrl);
}

SemanticDealer.prototype.getTracks = function(){
	
}

SemanticDealer.prototype.getArtist = function(trackId){
	
}

SemanticDealer.prototype.getRelatedArtists = function(artistId){

}

SemanticDealer.prototype.handleData = function(requestId){
	//Once data is fetched, it triggers this function
	this.treeBuilder.integrate(requestId);
	console.log('will procede to next step');
	$('body').trigger('upToDate');
	
	this.nextStep();
}

SemanticDealer.prototype.nextStep = function(){
	var self = this;
	(function recursiveTreeLoop(obj) {
		for (var key in obj) {
	    if (typeof(obj[key]) == 'object') {
	      recursiveTreeLoop(obj[key]);
	    } else {
	      var stepData = self.match(obj[key]);
				if(stepData){
					//If we have found a match, let's fire a request
					var requestId = self.treeBuilder.dataFetcher.addToQueue(stepData.urlToFetch, stepData.dataType, stepData.accessPath, stepData.type);
					obj[key] = requestId;
				}
	    }
	  }
	})(self.treeBuilder.content);
}

SemanticDealer.prototype.match = function(dataToMatch){
	
	var semanticMatching = {
		// %% = placeholder for matched IDs
		'^http:\/\/www\.freebase\.com\/view\/en\/(.{1,})$': 
				['http://www.freebase.com/experimental/topic/standard/en/%%','jsonp',['result','webpage'],'release-group link'],
		'^http:\/\/www\.freebase\.com\/view\/m\/([0-9a-z]{1,})$': 
				['http://www.freebase.com/experimental/topic/standard/m/%%','jsonp',['result','webpage'], 'release-group link'],
		'^http:\/\/mb-redir\.freebaseapps\.com\/redir\/([0-9a-z-]{1,})$':
				['http://mm.musicbrainz.org/ws/1/release-group/%%.html?type=xml&inc=releases','xml',['query','results','metadata','release-group','release-list','release'], 'release-group'],
		'^([0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12})$':
				['http://mm.musicbrainz.org/ws/1/release/%%?type=xml&inc=artist+tracks','xml',['query','results','metadata','release','track-list'], 'soundtrack']
	};
	for (var key in semanticMatching){
		//check Regex and make follow the right direction
		var regex = new RegExp(key,'g');
		var match = regex.exec(dataToMatch);
		if(match){ 
			var urlToFetch = semanticMatching[key][0].replace('%%',match[1]);
			var dataType = semanticMatching[key][1];
			var accessPath = semanticMatching[key][2];
			var type = semanticMatching[key][3]
			return {'urlToFetch': urlToFetch, 'dataType': dataType, 'accessPath': accessPath, 'type': type};
		}
	}
	return false;
}