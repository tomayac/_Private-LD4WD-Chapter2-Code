/***********************/
/* Nose follower class */
/***********************/

function DataFetcher(){
	//constructor here. What do we need?
	this.data = null; //once data is fetched, here it goes 
	this.rendering = ''; //variable to hold the rendered HTML
	this.type = 'neutral'; //variable containing the type of data
	this.lastRequest = new Date().getTime();
	this.queue = []; //To hold the queue of requests
	this.results = new Object();
	this.ID = 0; //ID of the setInterval() loop
}
DataFetcher.prototype.addToQueue = function(source, dataType, accessPath, type){
	if(!type){ var type = 'default'; }
	id = new Date().getTime();
	this.queue.push({'id': id,'source': source, 'dataType': dataType, 'accessPath': accessPath, 'type': type});
	return id;
}

DataFetcher.prototype.start = function(){
	//If the start() method is invoked, let's begin to fire some request
	var self = this;
	this.ID = setInterval(function(){self.fireNextRequest();}, 1000);
}

DataFetcher.prototype.fireNextRequest = function(){

	if(this.queue.length > 0){
		var nextRequest = this.queue[0];
		if(nextRequest.dataType == 'jsonp'){
			this.fireJsonpRequest(nextRequest);
		} else if(nextRequest.dataType == 'xml') {
			this.fireXmlRequest(nextRequest);
		} else {
			console.error("Fault! Datatype is not in the set supported by the app || i.e jsonp or xml at the moment.");
		}
	}
}

DataFetcher.prototype.fireJsonpRequest = function(request){
	console.log('entered FireJSON');
	var self = this;
	$.ajax({
		url: request.source,
		dataType: 'jsonp',
		success: function(data){
			self.findAndStore(data, request.accessPath, request.id, request.type);
		}
	});
}

DataFetcher.prototype.fireXmlRequest = function(request){
	var self = this;
	
	//Access-Control-Allow-Origin problem -- Let's use YQL to fetch the data
	encodedUrl = encodeURIComponent(source); //URLencoding is done before the parameter passing
	
	//Now, let's build the YQL query
	var YQLQuery = "select%20*%20from%20xml%20where%20url%3D%22" + encodedUrl + "%22";
	var YQLRestQuery = "http://query.yahooapis.com/v1/public/yql?q=" + YQLQuery + "&format=json&diagnostics=true&callback="
	console.log('YQL Query: ' + YQLRestQuery);
	
	$.ajax({
		url: YQLRestQuery,
		dataType: 'json',
		success: function(data){
			self.findAndStore(data, request.accessPath, request.id, request.type);
		}
	});
}

DataFetcher.prototype.findAndStore = function(data, accessPath, requestId, type){
	//To find into data @accessPath what we need, and store it in results array

	$.each(accessPath, function(){
			//at each iteration, we go down one level.
		if(data[this]){
			requestedData = data[this];
			data = requestedData;
		
		} else {
			console.error("Error baby...cannot access " + this);
			console.log(data);
			return false; //break the $.each() loop
		}
	});
	
	//let's store the result
	this.results[requestId] = {'data': requestedData, 'type': type};

	//And delete the item in the queue
	if(this.queue.length > 1){
		this.queue.splice(0,1);
	} else { this.queue = []; }	
	
	//trigger of the event to inform interface that new data is ready
	$('body').trigger('dataFetched', requestId);
	return;
}

DataFetcher.prototype.stop = function(){
	clearInterval(this.ID);
}

DataFetcher.prototype.clear = function(){
	this.queue = [];
	this.results = [];
}