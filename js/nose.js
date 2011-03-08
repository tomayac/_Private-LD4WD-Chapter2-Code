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
	
	function displaySoundtrack(tracks,elt){
		//function to display the soundtracks after the elt passed as argument
		
		if(!elt){
			//If no element was specified, let's append it to the body
			var elt = $("form");
		}
		
		details = $('<table />').addClass('details');
		var row;
		$.each(tracks, function(){
			row = $('<tr />').html('<td>'+ this.title +'</td><td>'+ this.duration +'</td>'); 
			details.append(row);
		})
		$('<tr />').append(details).insertAfter(elt);
	}
	
	function fetchSoundtrack(id, elt){
		//This function is here to retrieve the soundtrack info provided an Id like c8146647-dd7b-40cc-9d46-c53489a3651d
		//It then inserts it after the row of the elt passed as an argument
		
		//Let's compute the URL of the release group of the soundtrack
		var urlBase = 'http%3A%2F%2Fmm.musicbrainz.org%2Fws%2F1%2Frelease%2F';
		var soundtrackUrl = urlBase + id + '.html%3Ftype%3Dxml%26inc%3Dartist%2bcounts%2brelease-events%2bdiscs%2btracks';
		
		//Now, let's build the YQL query
		var YQLQuery = "select%20*%20from%20xml%20where%20url%3D%22" + soundtrackUrl + "%22";
		var YQLRestQuery = "http://query.yahooapis.com/v1/public/yql?q=" + YQLQuery + "&format=json&diagnostics=true&callback="
		
		log('Computed request for soundtrack: ' + soundtrackUrl);
		log('YQL Query: ' + YQLRestQuery);
		
		$.ajax({
			url: YQLRestQuery,
			dataType: 'json',
			success: function(data) {
			  if(data){ 
					if (data.query.results.metadata.release['track-list'].track){
						var tracks = data.query.results.metadata.release['track-list'].track;
						if(typeof tracks == 'object' && tracks.length > 0 ){
							displaySoundtrack(tracks,elt);
						}
						else{
							log('Error: tracks is not an object with size > 0')
						}
					}
					else{
						log('Error: tracks data has not the right structure');
					}
				}
				else{
					log("No data to work with when fetching the precise release.", 'error');
				}
			}
		});
		
	}
	
	function displayReleases(releases){
		//This function creates a table to diplay the releases
		log('beginning to write release table to DOM...');
		var table = $('<table />').addClass('releases');
		var row = $('<tr />').html('<th>Title</th><th>ID</th><th>Nb Tracks</th>');
		table.append(row);
		$.each(releases, function(){
			row = $('<tr />').html('<td class="title">'+ this.title +'</td><td>'+ this.id +'</td><td>'+ this['track-list'].offset +'</td>');
			table.append(row);
		})
		//Finally, let's append the table to the DOM
		$('body').append(table);
		log('table written to DOM. Enjoy.');
	}
	
	function getRelease(url) {
		//This function's parameter is the URI of a MusicBrainz Release, e.g, 
		// http://mb-redir.freebaseapps.com/redir/bc04101a-f099-3da6-a89f-41342bab4b80 -- with our Fight Club use case
		//It will use the ID of this Release group, and fetch a particular release of the soundtrack 
		
		//Let's compute the URL of the release group of the soundtrack
		var urlBase = 'http%3A%2F%2Fmm.musicbrainz.org%2Fws%2F1%2Frelease-group%2F';
		var id = url.substring(url.lastIndexOf('/') + 1 ); //get the part of the ur after the last "/", i.e, the ID
		releaseGroupUrl = urlBase + id + '.html%3Ftype%3Dxml%26inc%3Dreleases';
		
		//Now, let's build the YQL query
		var YQLQuery = "select%20*%20from%20xml%20where%20url%3D%22" + releaseGroupUrl + "%22";
		var YQLRestQuery = "http://query.yahooapis.com/v1/public/yql?q=" + YQLQuery + "&format=json&diagnostics=true&callback="
		
		log('Computed release group: ' + releaseGroupUrl);
		log('YQL Query: ' + YQLRestQuery);
		
		$.ajax({
			url: YQLRestQuery,
			dataType: 'json',
			success: function(data) {
			  if(data){ 
					if (data.query.results.metadata['release-group']['release-list'].release){
						var releases = data.query.results.metadata['release-group']['release-list'].release;
						if(typeof releases == 'object' && releases.length > 0 ){
							displayReleases(releases);
						}
						else if(releases.id){
							//We're in the case where there is only one soundtrack available, no list to choose from. Let's log that
							log('Only one soundtrack available so far. Fetching this one directly...');
							//Now, let's directly display that on the screen.
							fetchSoundtrack(releases.id);
						}
						else{
							log('Error: releases is not an object with size > 0')
						}
					}
					else{
						log('Error: release group data has not the right structure');
					}
				}
				else{
					log("No data to work with when fetching the release group.", 'error');
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
	
	/* End of functions definitions */
	/* App is ready to use */
	log("hello, it seems I'm ready to use. Welcome folks!");
	
	/* Autocompletion behaviour setup */
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
				//Let's clean the canvas: remove the previous results
				$('table').remove();
		    var url = ui.item.value;
		    var name = ui.item.label;
			  log("You selected" + name);
			  log("Will now try to fetch data about" + url);
			  getSoundtrackUrl(url);
		  }
		},
	});
	
	/* Console behaviour */
	$("#log a").click(function(){
		$(this).parent().toggle();
		$("#showLogs").toggle();
	})
	$("#showLogs").click(function(){
		$(this).toggle();
		$("#log").toggle();
	})
	
	
	/* expand table and crunch it when user clicks on the rows */
	$(".title").live('click', function(){
		if($(this).hasClass('expanded')){
			//We want to minify the table
			$('.details').remove();
			$(this).removeClass('expanded');
		}
		else{
			//We fetch the list of tracks corresponding to the click
			fetchSoundtrack($(this).next().html(),$(this).parent()) //we pass as a param: the ID in the second row, and the row after wich we want this to be displayed
			$(this).addClass('expanded');
		}
	})
	
	
	
});