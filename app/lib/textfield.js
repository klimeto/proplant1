//Application Window Component Constructor
function ApplicationTextField(title, callback) {
    if(title === undefined) { title=''; }
    
    var textField = Ti.UI.createTextField({
	  borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
	  top: 10, left: 10,
	  width: '90%',
	  height: '45dp',
	  borderWidth:"2",
	  borderColor:"#283618",
	  borderRadius:"5",
	  color:"#3C4037",
	  //backgroundColor: 'green',
	  value: title
	  
	});
    
	textField.addEventListener('click', function(evt){ 
		if(typeof callback === 'function') { 
			callback(evt); 
			console.log("EventListener :: onTextFieldClick :: callBack has been called !");
			return;
		}
		console.log("EventListener :: onTextFieldClick :: no callBack was given");	
	});
	
	return textField;
}

//make constructor function the public component interface
module.exports = ApplicationTextField;