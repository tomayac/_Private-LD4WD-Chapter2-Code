/****************************/
/* Setup of event listening */
/****************************/



$('body').bind('dataFetched', function(){
	myHead.memorize(myNose.data);
	myHead.think();
	//myHead.format(); //render it properly for user's display
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
			
			myNose = new Nose();
			myHead = new Head();
			myHead.nose = myNose;
			myHead.setUp(filmName);
			myNose.follow(url, 'jsonp', ['result','properties','/film/film/soundtrack', 'values'],'soundtracks');
			
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