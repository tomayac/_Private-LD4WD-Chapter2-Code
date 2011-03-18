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
	//this.treeBuilder.nextStep();
}