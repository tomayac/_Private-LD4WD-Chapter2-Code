/*******************************/
/* Setup & creation of objects */
/*******************************/

var displayWaiting = function(){
	var img = $('<img/>').attr({'src': 'img/ajax-loader.gif', 'alt': 'ajax loader', 'class': 'waiting'});
	$('body').append(img);
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
$('body').bind('upToDate', function(event){
	console.warn('Interface up-to-date');
	removeWaiting();
	render(mySemanticDealer.treeBuilder.content, mySemanticDealer.filmName);
})

/***********************/
/* For testing purpose */
/***********************/

$('#stop').click(function(){
	mySemanticDealer.dataFetcher.stop();
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
			displayWaiting();
			mySemanticDealer.start();
			
		}
	},
});

/*************************************/
/* Let's simplify the tree on demand */
/*************************************/

$("h1").click(function(){
	
	if($(this).hasClass('simple')){
		$(this).removeClass('simple');
		console.log('rendering complex tree');
		console.log(myHead.memory);
		render(myHead.memory, myHead.filmName);
		$(this).css('font-family', 'monospace');
	} else {
		myHead.format();
		render(myHead.simpleTree, myHead.filmName);
		$(this).css('font-family', 'Arial, sans-serif');
		$(this).addClass('simple');
	}
	
});