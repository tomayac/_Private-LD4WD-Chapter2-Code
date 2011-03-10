/***********************/
/* URL Encode / Decode */
/***********************/
//Source : http://plugins.jquery.com/project/URLEncode
$.extend({URLEncode:function(c){var o='';var x=0;c=c.toString();var r=/(^[a-zA-Z0-9_.]*)/;
  while(x<c.length){var m=r.exec(c.substr(x));
    if(m!=null && m.length>1 && m[1]!=''){o+=m[1];x+=m[1].length;
    }else{if(c[x]==' ')o+='+';else{var d=c.charCodeAt(x);var h=d.toString(16);
    o+='%'+(h.length<2?'0':'')+h.toUpperCase();}x++;}}return o;},
URLDecode:function(s){var o=s;var binVal,t;var r=/(%[^%]{2})/;
  while((m=r.exec(o))!=null && m.length>1 && m[1]!=''){b=parseInt(m[1].substr(1),16);
  t=String.fromCharCode(b);o=o.replace(m[1],t);}return o;}
});

/***********************/
/* The awesome console */
/***********************/

function log( message, style) {
	//Define the console to display messages
	// 3 "styles" for the messages can be used, defined in the CSS via classes: default, success & error
	if(!style){ var style = "default"; }
	var ourMessage = $('<div/>').html(message).addClass(style);
	$('#log').prepend(ourMessage);
}

/* Console behaviour */
$("#log a").click(function(){
	$(this).parent().toggle();
	$("#showLogs").toggle();
})
$("#showLogs").click(function(){
	$(this).toggle();
	$("#log").toggle();
})

/****************************/
/* Setup of event listening */
/****************************/

myNose = new Nose();

//Attach custom event to listen to updates
$('body').bind('noseFetch', function(){
	myNose.render();
})
$('body').bind('updateLinkedData', function(){
	$('#data').html(myNose.rendering);
});

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
		  log("You selected" + name);
		  log("Will now try to fetch data about" + url);
	  	myNose.follow(url, 'jsonp', ['result','properties','/film/film/soundtrack', 'values'],'soundtracks');
		}
	},
});

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

//Woohoo! We're all set up. Let's gooo!
log("hello, it seems I'm ready to use. Welcome folks!");

//testing xml case || working so far !!
//var encodedUrl = 'http%3A%2F%2Fmm.musicbrainz.org%2Fws%2F1%2Frelease%2Fc8146647-dd7b-40cc-9d46-c53489a3651d.html%3Ftype%3Dxml%26inc%3Dartist%2bcounts%2brelease-events%2bdiscs%2btracks';
//myNose.follow(encodedUrl, 'xml', ['query', 'results', 'metadata', 'release','track-list','track']);

