//Application Window Component Constructor
function ApplicationListView(headerTitle, dataSet, callback) {
    var myTemplate = {
	    childTemplates: [
	        {                            // Image justified left
	            type: 'Ti.UI.ImageView', // Use an image view for the image
	            bindId: 'pic',           // Maps to a custom pic property of the item data
	            properties: {            // Sets the image view  properties
	                width: '50dp', height: '50dp', left: 0,
	                font: { fontFamily:'Arial', fontSize: '14dp' },
	            }
	        },
	        {                            // Title 
	            type: 'Ti.UI.Label',     // Use a label for the title 
	            bindId: 'title',          // Maps to a custom info property of the item data
	            properties: {            // Sets the label properties
	                color: 'black',
	                
	                font: { fontFamily:'Arial', fontSize: '18dp', fontWeight:'bold' },
	                left: '10dp', height: '45dp', width: '100%' //, top: 0,
	            }
	        }
	    ]
	};
	
	var listView = Ti.UI.createListView({
	    // Maps myTemplate dictionary to 'template' string
	    templates: { 'template': myTemplate },
	    // Use 'template', that is, the myTemplate dict created earlier
	    // for all items as long as the template property is not defined for an item.
	    defaultItemTemplate: 'template'
	});
	
	var sections = [];
	
	if(headerTitle === undefined){ var section = Ti.UI.createListSection(); }else{ var section = Ti.UI.createListSection({ headerTitle: headerTitle });	}	
	
	if(dataSet === undefined) {
		dataSet = [
		    { title: {text: 'no items in dataset...'}}
		];
	}
	
	section.setItems(dataSet);
	sections.push(section);
	
	listView.setSections(sections);
	
	listView.addEventListener('itemclick', function(evt){
		if(typeof callback === 'function') { 
			callback(evt); 
			console.log("EventListener :: onItemclick :: callBack has been called !");
			return;
		}
		console.log("EventListener :: onItemclick :: no callBack was given");
	});
	
	return listView;
}

//make constructor function the public component interface
module.exports = ApplicationListView;