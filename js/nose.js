/***********************/
/* Nose follower class */
/***********************/

function Nose(){
	//constructor here. What do we need?
	this.data = null; //once data is fetched, here it goes 
	this.rendering = ''; //variable to hold the rendered HTML
	this.type = 'neutral'; //variable containing the type of data
	this.lastRequest = new Date().getTime();
}
Nose.prototype.follow = function(source, dataType, accessPath, type){
	var self = this;
	//method to fetch data from a certain source -- MusicBrainz or Freebase -- using Jquery and/or YQL
	//accessPath variable is an aray containing the keys of the data tree, e.g, ['data','query','results']
	
	if(type){ self.type = type; }
	
	/* Sleep function not to be kicked out of WS */
	function sleep(milliseconds) {
		console.log('going to sleep a little bit...');
	  var start = new Date().getTime();
	  for (var i = 0; i < 1e7; i++) {
	    if ((new Date().getTime() - start) > milliseconds){
	      break;
	    }
	  }
	}
	
	function dataHandler(data){
		//General purpose function to, given a certain data and a path, return the interesting part
		var requestedData;
		$.each(accessPath, function(){
				//at each iteration, we go down one level.
				if(data[this]){
					requestedData = data[this];
					data = requestedData;
				
				} else {
					//Error handling 
					console.log("Error baby...cannot access " + this);
					console.log(data);
					return false; //break the $.each() loop
				}
		});
		//let's store the result in an instance variable
		self.data = requestedData;
		
		//trigger of the event to inform interface that new data is ready
		$('body').trigger('dataFetched');
	}
	
	//If last request was fired less than a second ago, let's wait.
	var now = new Date().getTime();
	if(now < self.lastRequest + 1000){ sleep(1000); }
	else{ console.log('Not feeling sleepy. Now is' + now + ' and last request was ' + self.lastRequest); }
	
	self.lastRequest = new Date().getTime();
	switch( dataType ){
		
		case 'jsonp':
				//old classic cross-browser AJAX call via JQuery			
				$.ajax({
					url: source,
					dataType: dataType,
					success: dataHandler
				});
				break;
		
		case 'xml':
				//Access-Control-Allow-Origin problem -- Let's use YQL to fetch the data
	
				encodedUrl = encodeURIComponent(source); //URLencoding is done before the parameter passing
				//Now, let's build the YQL query
				var YQLQuery = "select%20*%20from%20xml%20where%20url%3D%22" + encodedUrl + "%22";
				var YQLRestQuery = "http://query.yahooapis.com/v1/public/yql?q=" + YQLQuery + "&format=json&diagnostics=true&callback="
				console.log('YQL Query: ' + YQLRestQuery);

				$.ajax({
					url: YQLRestQuery,
					dataType: 'json',
					success: dataHandler
				});
				break;
		
		default:
				console.log("Fault! Datatype is not in the set supported by the app || i.e jsonp or xml at the moment.");
			
	}
	
}
