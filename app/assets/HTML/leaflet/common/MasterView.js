//Master View Component Constructor
function MasterView() {
	//create object instance, parasitic subclass of Observable
	
	var db = Ti.Database.install('/data/Wells.mbtiles', 'nebraskaWells');
	db.close();
	db = null;
	
	
	Ti.App.addEventListener('getGeoJson',function(e){
		var geoDataFile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + 'data/' + e.fileName + '.json');
		var preParseData = (geoDataFile.read().text); 
		var response = JSON.parse(preParseData);
		Titanium.App.fireEvent('receiveGeoJson',{
			geojsonFeature: response
		});
		preParseData = null;
	});
	
	var self = Ti.UI.createWebView({
		url:'/ui/common/map.html'
	});
	
	
	Ti.App.addEventListener('getMbTiles',function(e){
 		aData = [];
 		aUpdate = JSON.parse(e.aUpdate);
 		//alert(aUpdate.length);
 		
		var base64Prefix = 'data:image/png;base64,';
		var db = Ti.Database.open('nebraskaWells');
 		for (i=0;i<aUpdate.length;i++){
 			var rows = db.execute("SELECT tile_data FROM images INNER JOIN map ON images.tile_id = map.tile_id WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?", aUpdate[i].z, aUpdate[i].x, aUpdate[i].y);
 			while (rows.isValidRow()) {
 				img64 = base64Prefix + Titanium.Utils.base64encode(rows.field(0));
				Titanium.App.fireEvent('receiveTileUrl',{
					url:img64,
					id:aUpdate[i].id
				});
				rows.next();
 			}
			rows.close();
 		}
		db.close();
	});
		
	

	

	
			

	
	return self;
};

module.exports = MasterView;