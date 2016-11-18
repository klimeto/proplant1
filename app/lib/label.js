//Application Window Component Constructor
function ApplicationLabel(title, callback) {
    if(title === undefined) { title='This is label'; }
    var label = Ti.UI.createLabel({
	  color: 'black',
	  font: { fontSize:20 },
	  //shadowColor: '#aaa',
	  //shadowOffset: {x:5, y:5},
	  //shadowRadius: 3,
	  text: title,
	  textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
	  //top: 30,
	  width: '90%', height: '45dp'
	  //backgroundColor: 'yellow'
	});
	
	label.addEventListener('click', function(evt){ 
		if(typeof callback === 'function') { 
			callback(evt); 
			console.log("EventListener :: onLabelClick :: callBack has been called !");
			return;
		}
		console.log("EventListener :: onLabelClick :: no callBack was given");	
	});
	
	return label;
}

//make constructor function the public component interface
module.exports = ApplicationLabel;