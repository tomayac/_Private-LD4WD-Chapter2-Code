/***********************/
/* Nose follower class */
/***********************/

function Nose(){
	//constructor here. What do we need?
	this.data = null //once data is fetched, here it goes 
	this.rendering = '' //variable to hold the rendered HTML
	this.type = 'neutral' //variable containing the type of data
}
Nose.prototype.follow = function(source, dataType, accessPath, type){
	var self = this;
	//method to fetch data from a certain source -- MusicBrainz or Freebase -- using Jquery and/or YQL
	//accessPath variable is an aray containing the keys of the data tree, e.g, ['data','query','results']
	
	if(type){ self.type = type; }
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
					console.log(data)
					return false; //break the $.each() loop
				}
		});
		//let's store the result in an instance variable
		self.data = requestedData;

		//trigger of the event to inform interface that new data is ready
		$('body').trigger('noseFetch');
	}
	
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
	
				encodedUrl = source; //URLencoding is done before the parameter passing
				//Now, let's build the YQL query
				var YQLQuery = "select%20*%20from%20xml%20where%20url%3D%22" + encodedUrl + "%22";
				var YQLRestQuery = "http://query.yahooapis.com/v1/public/yql?q=" + YQLQuery + "&format=json&diagnostics=true&callback="
				log('YQL Query: ' + YQLRestQuery);

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
Nose.prototype.render = function(){
	//This method transforms this.data into HTML table
	var self = this;
	// The 2 functions CreateTableView() and CreateDetailView() are adapted from Zachary Hunter 
	// Source : http://www.zachhunter.com/2010/04/json-objects-to-html-table/
	function CreateTableView(objArray) {
			
			//Let's be sure that the parameter is an Array of objects
			if(!objArray[0]){
				//If it's not, let's create it
				objArray = new Array(objArray);
			}
			
	    var str = '<table class="tableView '+ self.type +'">';

	    // table head
	    str += '<thead><tr>';
	    
			for (var index in objArray[0]) {
        str += '<th scope="col">' + index + '</th>';
    	}
    	str += '</tr></thead>';

	    // table body
	    str += '<tbody>';
	    for (var i = 0; i < objArray.length; i++) {
	        str += (i % 2 == 0) ? '<tr class="alt">' : '<tr>';
	        for (var index in objArray[i]) {
	            if(typeof objArray[i][index] != 'object'){
								str += '<td>' + objArray[i][index] + '</td>';
							} else {
								str += '<td>' + CreateTableView(objArray[i][index]) + '</td>';
							}
	        }
	        str += '</tr>';
	    }
	    str += '</tbody>'
	    str += '</table>';
	    return str;
	}
	function CreateDetailView(objArray) {

	    var str = '<table class="detailView">';
	    str += '<tbody>';

	    for (var i = 0; i < objArray.length; i++) {
	        var row = 0;
	        for (var index in objArray[i]) {
	            str += (row % 2 == 0) ? '<tr class="alt">' : '<tr>';

	            //table "head"
	            str += '<th scope="row">' + index + '</th>';

	            str += '<td>' + objArray[i][index] + '</td>';
	            str += '</tr>';
	            row++;
	        }
	    }
	    str += '</tbody>'
	    str += '</table>';
	    return str;
	}
	
	console.log('Now rendering...');
	if(this.data){
		this.rendering = CreateTableView(this.data);
	}
	$('body').trigger('updateLinkedData');
}