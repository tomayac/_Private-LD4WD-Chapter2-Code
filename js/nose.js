/*
 Script to implement the "Follow your nose" behaviour
*/

$(function() {
	function log( message ) {
		var ourMessage = $('<div/>').html(message);
		$('#log').prepend(ourMessage);
	}

	function getRelease(url) {
		$.ajax({
			url: url,
			dataType: 'jsonp',
			success: function(data) {
			  if (data.result.url) {
			    var id = data.result.url;
				  log(id);

				}
			}
		});    		      		  
	}
	
	function getSoundtrack(url) {
		$.ajax({
			url: url,
			dataType: 'jsonp',
			success: function(data) {
			  if (data.result.webpage) {
				  var text = data.result.webpage[0].text;
				  var soundtrackUrl = data.result.webpage[0].url;
				  log("soundtrack found @"+ text +": " + soundtrackUrl);
				  alert("getSoundtrack finished");
					//getRelease('http://www.freebase.com/experimental/topic/standard' + id);
				  }
			}
		});    		      		  
	}
	
	function getSoundtrackUrl(url) {
		$.ajax({
			url: url,
			dataType: 'jsonp',
			success: function(data) {
			  if (data.result.properties['/film/film/soundtrack'].values[0]) {
			    var id = data.result.properties['/film/film/soundtrack'].values[0].id;
				  log("performing getSoundTrack('http://www.freebase.com/experimental/topic/standard" + id + "')")
				  getSoundtrack('http://www.freebase.com/experimental/topic/standard' + id);
				  }
			}
		});    		  
	}
	$('#movie').autocomplete({
		//Thanks to the JQuery UI, let's implement autocompletion
		source: function(request, response) {
			$.ajax({
				//base URL for the Freebase API
				url: 'http://freebase.com/api/service/search?',
				//We want JSON data returned
				dataType: 'jsonp',
				//We force a request stricly restricted to films
				data: { query: request.term, type: '/film/film', type_strict: 'all', limit: 3 },
				success: function(data) {
					response($.map(data.result, function(item) {
						return {
							label: item.name + ' http://freebase.com' + item.id,
							value: 'http://www.freebase.com/experimental/topic/standard' + item.id
						}
					}));
				}
			});
		},
		minLength: 2,
		select: function(event, ui) {
		  //When a option of the list is selected
			if (ui.item) {
		    var url = ui.item.value;
		    var name = ui.item.label;
			  log("You selected" + name);
			  log("Will now try to fetch data about" + url);
			  getSoundtrackUrl(url);
		  }
		},
	});
	
	//functions are defined. DOM is loaded. Let's go.
	log("hello, it seems I'm ready to use. Welcome folks!");
	
});