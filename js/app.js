/****************************/
/* Setup of event listening */
/****************************/

myNose = new Nose();
myHead = new Head();

$('body').bind('dataFetched', function(){
	myHead.format(myNose.data);
	render(myHead.memory, myHead.filmName);
	
})

/****************************/
/* Autocompletion behaviour */
/****************************/

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
		  console.log("You selected" + name);
		  console.log("Will now try to fetch data about" + url);
	  	var filmName = name.substr(0,name.lastIndexOf(' '));
			myHead.setUp(filmName);
			myNose.follow(url, 'jsonp', ['result','properties','/film/film/soundtrack', 'values'],'soundtracks');
			
		}
	},
});

/* Legacy from the precedent interface


//Now, when user clicks on something, let's do the right thing according to what's in there
$('td').live('click',function(){
	var value = $(this).html();
	
	//All the logic goes here
	if($('table').hasClass('soundtracks')){
		var regex = /^http:\/\/www\.freebase\.com\/view\/en\/.{1,}$/;
		if(regex.test(value)){
			urlToFollow = "http://www.freebase.com/experimental/topic/standard/en/" + value.substring(value.lastIndexOf("/")+1);  
			log('Nose will now follow ' + urlToFollow);
			myNose.follow(urlToFollow, 'jsonp', ['result','webpage'],'release');
		}
		var regex = /^http:\/\/www\.freebase\.com\/view\/m\/[0-9a-z]{1,}$/;
		if(regex.test(value)){
			urlToFollow = "http://www.freebase.com/experimental/topic/standard/m/" + value.substring(value.lastIndexOf("/")+1);  
			log('Nose will now follow ' + urlToFollow);
			myNose.follow(urlToFollow, 'jsonp', ['result','webpage'],'release-group');
		}
		
	}
	
	if($('table').hasClass('release-group')){
		var regex = /^http:\/\/mb-redir\.freebaseapps\.com\/redir\/.{1,}$/;
		if(regex.test(value)){
			urlToFollow = "http%3A%2F%2Fmm.musicbrainz.org%2Fws%2F1%2Frelease-group%2F" + value.substring(value.lastIndexOf("/")+1) + ".html%3Ftype%3Dxml%26inc%3Dreleases";  
			log('Nose will now follow ' + urlToFollow);
			myNose.follow(urlToFollow, 'xml', ['query','results','metadata','release-group','release-list','release'],'release');
		}
	}
	
	if($('table').hasClass('releases')){
		var regex = /^http:\/\/www\.freebase\.com\/view\/m\/.{1,}$/;
		if(regex.test(value)){
			urlToFollow = "http://www.freebase.com/experimental/topic/standard/m/" + value.substring(value.lastIndexOf("/")+1);  
			log('Nose will now follow ' + urlToFollow);
			myNose.follow(urlToFollow, 'jsonp', ['result','webpage'],'release');
		}
	}
	
	if($('table').hasClass('release')){
		var regex = /^http:\/\/mb-redir\.freebaseapps\.com\/redir\/.{1,}$/;
		if(regex.test(value)){
			urlToFollow = "http%3A%2F%2Fmm.musicbrainz.org%2Fws%2F1%2Frelease%2F" + value.substring(value.lastIndexOf("/")+1) + ".html%3Ftype%3Dxml%26inc%3Dartist%2bcounts%2brelease-events%2bdiscs%2btracks";  			
			log('Nose will now follow ' + urlToFollow);
			myNose.follow(urlToFollow, 'xml', ['query','results','metadata','release','track-list','track'],'tracklist');
		}
		
		var altRegex = /^[a-z0-9-]{1,}$/;
		if(altRegex.test(value)){
			urlToFollow = "http%3A%2F%2Fmm.musicbrainz.org%2Fws%2F1%2Frelease%2F" + value + ".html%3Ftype%3Dxml%26inc%3Dartist%2bcounts%2brelease-events%2bdiscs%2btracks";  			
			log('Nose will now follow ' + urlToFollow);
			myNose.follow(urlToFollow, 'xml', ['query','results','metadata','release','track-list','track'],'tracklist');
		}
	}
	
	if($('table').hasClass('tracklist')){
		var regex = /^[a-z0-9-]{1,}$/;
		if(regex.test(value)){
			urlToFollow = "http%3A%2F%2Fmm.musicbrainz.org%2Fws%2F1%2Ftrack%2F" + value + ".html%3Ftype%3Dxml%26inc%3Dartist";  			
			log('Nose will now follow ' + urlToFollow);
			myNose.follow(urlToFollow, 'xml', ['query','results','metadata','track', 'artist'],'artist');
		}
	}
	
	if($('table').hasClass('artist')){
		var regex = /^[a-z0-9-]{1,}$/;
		if(regex.test(value)){
			urlToFollow = "http%3A%2F%2Fmm.musicbrainz.org%2Fws%2F1%2Fartist%2F" + value + ".html%3Ftype%3Dxml%26inc%3Dartist-rels";  			
			log('Nose will now follow ' + urlToFollow);
			myNose.follow(urlToFollow, 'xml', ['query','results','metadata','artist', 'relation-list', 'relation' ],'related-artists');
		}
	}
	
});

*/