/***************************************/
/* Let's use Protovis to see the magic */
/***************************************/

var render = function(json, rootName){

var svgElements = document.getElementsByTagName('svg')
if(svgElements){
	for(var i=0; i<svgElements.length ; i++){
		svgElements[i].parentElement.removeChild(svgElements[i]);
	}
}

var vis = new pv.Panel()
    .width(1000)
    .height(500);

var tree = vis.add(pv.Layout.Tree)
    .nodes(pv.dom(json).root(rootName).nodes())
    .depth(65)
    .breadth(20.25)
    .orient("radial");

tree.link.add(pv.Line);

tree.node.add(pv.Dot).fillStyle(function(n){n.firstChild ? "#aec7e8" : "#ff7f0e"});
tree.label.add(pv.Label);

vis.render();

console.log('rendering done');

}