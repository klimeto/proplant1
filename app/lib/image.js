//Application Window Component Constructor
function ApplicationImage(img, callback) {
	if(img === undefined) { img='/KS_nav_views.png'; }
	var image = Ti.UI.createImageView({
	  image: img
	});
	
	image.addEventListener('click', function(evt){ 
		if(typeof callback === 'function') { 
			callback(evt); 
			console.log("EventListener :: onImageClick :: callBack has been called !");
			return;
		}
		console.log("EventListener :: onImageClick :: no callBack was given");	
	});
	
	return image;
}

//make constructor function the public component interface
module.exports = ApplicationImage;