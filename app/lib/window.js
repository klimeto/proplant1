//Application Window Component Constructor
function ApplicationWindow(title, exitOnClose, showIcons, showIconsCallback) {
    var spacer = "==========================================================================================";
    if(title === undefined) { title="Title_here"; }
	if(exitOnClose === undefined) { exitOnClose=false; }
	if(showIcons === undefined) { showIcons=false; }
	if(typeof showIconsCallback === 'function') {  }else{ showIconsCallback=function(){ alert("Default click"); }; }
	
	console.log(spacer);
	console.log("Opening window with title: "+title);
	console.log(spacer);
	
	//create component instance
	var self = Ti.UI.createWindow({
		backgroundColor:'#ffffff',
		navBarHidden:true,
		exitOnClose:exitOnClose
	});
	
	self.addEventListener("open", function() {
		actionBar = self.activity.actionBar; 
		actionBar.title=title; 
		
		if(showIcons)
		{
			self.activity.onCreateOptionsMenu = function(e) {
		        
		        var menuItem = e.menu.add({
		            title : "Delete",
		            showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
		            icon:  '/images/ic_menu_delete.png' 
		        });
		        menuItem.addEventListener("click", showIconsCallback);
		        
		        menuItem = e.menu.add({
		            title : "Save",
		            showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
		            icon:  '/images/ic_menu_save.png'
		        });
		       menuItem.addEventListener("click", showIconsCallback);
		       
		    };
		    self.activity.invalidateOptionsMenu();
		    console.log("EventListener :: onWindowOpened :: drawing menu icons");
		}
		
	    
		console.log("EventListener :: onWindowOpened ::");
	});
	
	return self;
}

//make constructor function the public component interface
module.exports = ApplicationWindow;