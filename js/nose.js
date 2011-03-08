/*
 Script to implement the "Follow your nose" behaviour
*/

$(function() {
	function log( message, style) {
		//Define the console to display messages
		// 3 "styles" for the messages can be used, defined in the CSS via classes: default, success & error
		if(!style){ var style = "default"; }
		var ourMessage = $('<div/>').html(message).addClass(style);
		$('#log').prepend(ourMessage);
	}
	
	function getRelease(url) {
		//This function's parameter is the URI of a MusicBrainz Release, e.g, 
		// http://mb-redir.freebaseapps.com/redir/bc04101a-f099-3da6-a89f-41342bab4b80 -- with our Fight Club use case
		//It will use the ID of this Release group, and fetch a particular release of the soundtrack 
		
		var urlBase = 'http://mm.musicbrainz.org/ws/1/release-group/';
		var id = url.substring(url.lastIndexOf('/') + 1 ); //get the part of the ur after the last "/", i.e, the ID

		releaseGroupUrl = urlBase + id + '.html?type=xml&inc=releases';
		log('Computed release group: ' + releaseGroupUrl);
		$.ajax({
			url: releaseGroupUrl,
			dataType: 'xml',
			success: function(xml) {
			  $("/addresses/address", xml).each(function(){
					alert(this.attr('id'));
					alert($('title'), this);
				});
			}
		});    		      		  
	}
	
	function getSoundtrack(url) {
		$.ajax({
			url: url,
			dataType: 'jsonp',
			success: function(data) {
			  if (data.result.webpage) {
					var text = false;
					var soundtrackUrl = false;
					$.each(data.result.webpage, function(){
					  if(this.text == 'MusicBrainz'){
							//We found a MusicBrainz reference to follow
							if(!text && !soundtrackUrl){
								text = this.text;
								soundtrackUrl = this.url;
							}
						}
					});
					if(!text || !soundtrackUrl){ log('Dead-end: the url ' + url + ' has not yield any MusicBrainz results. Sorry about that.', 'error')}
				  else{ 
						log('Bingo! Soundtrack found @MusicBrainz: ' + soundtrackUrl, 'success'); 
						getRelease('http://www.freebase.com/experimental/topic/standard' + soundtrackUrl);
					}
					
				}
				else{
					//no data.result.webpage
					log("Couldn't find data.result.webpage", 'error');
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