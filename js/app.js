/*******************************/
/* Setup & creation of objects */
/*******************************/

var displayWaiting = function(progress, activity){
	$('.waiting').remove();
	
	//var img = $('<img/>').attr({'src': 'img/ajax-loader.gif', 'alt': 'ajax loader', 'class': 'waiting'});
	var progress = $('<progress />').attr({'max': '100', 'value': progress}).html(progress + '%');
	var txt = $('<p />').html('<span>' + activity);
	var loadingContainer = $('<div />').addClass('waiting').append(progress).append(txt);
	loadingContainer.insertAfter('form');
}
var removeWaiting = function(){
	$('.waiting').remove();
}

/****************************/
/* Setup of event listening */
/****************************/

$('body').bind('dataFetched', function(event, requestId){
	console.warn('dataFetched signal catched! Woohoo, my results are ready for request #' + requestId);
	mySemanticDealer.handleData(requestId);
})
$('body').bind('loading', function(event, progress, activity){
	//var progress = mySemanticDealer.treeBuilder.progress;
	//var activity = mySemanticDealer.treeBuilder.activity;
	console.warn('Interface loading, at '+ progress +'%. Current activity: '+ activity);
	displayWaiting(progress, activity);
})
$('body').bind('upToDate', function(event){
	console.warn('Interface up-to-date');
	removeWaiting();
	mySemanticDealer.treeBuilder.computeSimpleTree();
	var nbTracks = mySemanticDealer.treeBuilder.simpleTree.tracks.length;
	var breadth = Math.floor(220/nbTracks);
	render(mySemanticDealer.treeBuilder.simpleTree, mySemanticDealer.filmName, breadth);
})

/**********************************************/
/* For testing purpose only -- Keep out folks */
/**********************************************/

$('#stop').click(function(){
	mySemanticDealer.dataFetcher.stop();
});
$('#complexTree').click(function(){
	render(mySemanticDealer.treeBuilder.content, mySemanticDealer.filmName);
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
						label: item.name,
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
		  console.log("You selected " + name);
		  console.log("Will now try to fetch data about " + url);
			
			mySemanticDealer = new SemanticDealer(name, url);
			displayWaiting(0, 'In the starting blocks. Ready?');
			mySemanticDealer.start();
			
		}
	},
});