//$.acslogin.init({callback: function(e){//login success callback}});

//TODO LIST
/*
1. ADD removeEventListener before each addEventListener and name the main function and take outside
2. ZOOM on my own last annotation or other last annotation
3. Close all DB connections or most ideal create function
4. If items to be pushed, leading from internet must warn users that the local data can be lost
5. Merge functions on buttons in the data tab
6. Create LOG table in server database to update/delete ...

 */
// DATABASE NAME
var menoDatabazy = "db11";

// DEVICE CONNECTION TO THE INTERNET
var isOnline = Titanium.Network.getOnline();

// DEVICE PLATFORM IS ANDROID
var isAndroid = Ti.Platform.osname === 'android';

// MAP MODULE
var MapModule = require('ti.map');

//var tiosmdroid = require("ti.osmdroid");
var mapview;
//var mapview = MapModule.getView();

//MapModule.//mapview.mapToolbarEnabled('false');

// Api Level
var apiLevel= Ti.Platform.Android.API_LEVEL;

// LINK TO PROJECT WEB SITE
try {
	$.buttonProjectPage.removeEventListener('click', projectPageLink);
	} catch (e) {}
	$.buttonProjectPage.addEventListener('click', projectPageLink);

function projectPageLink ()
{	
	Ti.Platform.openURL("http://bolegweb.geof.unizg.hr/proplant/");
}
//click listener on mapview
var currentGML;
var currentFeatIdIn;

/*
mapview.addEventListener('click', function (evt) {
	// CLICK TO EDIT ATTRIBUTES
	if (evt.clicksource == 'infoWindow' || evt.clicksource == 'title' || evt.clicksource == 'subtitle') {
		Ti.API.info("Annotation " + evt.title + " clicked, gmlID: " + evt.annotation.gmlID + " clicksource: " + evt.clicksource);
		$.index.setActiveTab(3);
		$.formLabel.setText('Form: ' + evt.annotation.gmlID);
		$.plntNameField.setValue(evt.annotation.title);
		$.siteConfField.setValue(evt.annotation.site_conf);
		$.sdField.setValue(evt.annotation.site_descr);
		$.imageField.setValue(evt.annotation.photo);
		$.dateField.setValue(evt.annotation.obs_date);
		$.certainityField.setValue(evt.annotation.crtn);

		currentGML = evt.annotation.gmlID;
		currentFeatIdIn = evt.annotation.featIdIn;

		if ($.nicknameField.getValue() != evt.annotation.uid)
			{
			$.buttonDeleteRecord.hide();
			$.buttonDeleteRecord.removeEventListener('click', eventListMarkForDel);

			$.buttonSaveForm.hide();
			$.buttonSaveForm.removeEventListener('click', eventListSaveForm);
			$.plntNameField.setEditable('false');
			$.siteConfField.setEditable('false');
			$.sdField.setEditable('false');
			$.imageField.setEditable('false');
			$.dateField.setEditable('false');
			$.certainityField.setEditable('false');
			$.plntNameField.removeEventListener('click', eventListPlantsList);
			$.dateField.removeEventListener('click', eventListDatePicker);
			$.imageField.removeEventListener('click', eventListenerCamera);
			$.certainityField.removeEventListener('click', eventListCrtn);
			$.siteConfField.removeEventListener('click', eventSiteConf);

		} else {
			$.buttonDeleteRecord.show();
			try {
				$.buttonDeleteRecord.removeEventListener('click', eventListMarkForDel);
			} catch (e) {}
			$.buttonDeleteRecord.addEventListener('click', eventListMarkForDel);

			$.buttonSaveForm.show();
			try {
				$.buttonSaveForm.removeEventListener('click', eventListSaveForm);
			} catch (e) {}
			$.buttonSaveForm.addEventListener('click', eventListSaveForm);
			$.plntNameField.setEditable('false');
			$.siteConfField.setEditable('false');
			$.sdField.setEditable('true');
			$.imageField.setEditable('false');
			$.dateField.setEditable('false');
			$.certainityField.setEditable('false');

			try {
				$.plntNameField.removeEventListener('click', eventListPlantsList);
			} catch (e) {}
			$.plntNameField.addEventListener('click', eventListPlantsList);

			try {
				$.dateField.removeEventListener('click', eventListDatePicker);
			} catch (e) {}
			$.dateField.addEventListener('click', eventListDatePicker);
			try {
				$.imageField.removeEventListener('click', eventListenerCamera);
			} catch (e) {}
			$.imageField.addEventListener('click', eventListenerCamera);
			try {
				$.certainityField.removeEventListener('click', eventListCrtn);
			} catch (e) {}
			$.certainityField.addEventListener('click', eventListCrtn);
			try {
				$.siteConfField.removeEventListener('click', eventSiteConf);
			} catch (e) {}
			$.siteConfField.addEventListener('click', eventSiteConf);
		}
	}
});
*/
var opts;
var dialog;

// CIRCULAR REFERENCE
var o = {};
o.o = o;
var cache = [];
JSON.stringify(o, function (key, value) {
	if (typeof value === 'object' && value !== null) {
		if (cache.indexOf(value) !== -1) {
			// Circular reference found, discard key
			return;
		}
		// Store value in our collection
		cache.push(value);
	}
	return value;
});

// ENABLE GARBAGE COLLECTION
cache = null;

//PROCESS INDICATOR
var activityIndicator = Ti.UI.createActivityIndicator({
		color : 'black',
		font : {
			fontFamily : 'Helvetica Neue',
			fontSize : 36,
			fontWeight : 'bold'
		},
		message : 'Loading...',
		style : Ti.UI.ActivityIndicatorStyle.BIG_DARK,
		top : "25%",
		left : "5%",
		height : "50%",
		width : "90%"
	});

var endpoint = $.endpointURL.getValue();

var db = Ti.Database.open(menoDatabazy);

//CREATE TABLE TO STORE INFORMATION ABOUT EACH ANNOTATION CREATED
db.execute('CREATE TABLE IF NOT EXISTS annotations (' +
	'id INTEGER PRIMARY KEY,' +
	'lat DECIMAL (15,7) NOT NULL,' +
	'lon DECIMAL (15,7) NOT NULL,' +
	'acc DECIMAL (10,4),' +
	'alt DECIMAL (10,4),' +
	'ala DECIMAL (10,4),' +
	'type varchar(255),' +
	'gmlID varchar(255),' +
	'featureType varchar(255),' +
	'endpoint varchar(255),' +
	'plnt_name varchar(255),' +
	'image varchar(255),' +
	'obs_date varchar(255),' +
	'uid varchar(255),' +
	'crtn varchar(255),' +
	'site_conf varchar(255),' +
	'site_descr varchar(255),' +
	'mark_for_push integer(1) default 0,' +
	'mark_for_del integer(1) default 0' +
	');	');

//CREATE TABLE TO STORE INFORMATION ABOUT EACH ANNOTATION CREATED
db.execute('CREATE TABLE IF NOT EXISTS featureTypes (' +
	'featureType varchar(255),' +
	'endpoint varchar(255)' +
	');	');

db.close();

//db.execute ('CREATE INDEX endpoint ON annotations(endpoint);');
//db.execute('CREATE INDEX featureType ON annotations(featureType);');
//db.close();

// ENSURE THE ID IS INCREMENTING FROM THE LAST VALUE
var featIdIn = 1;
var db = Ti.Database.open(menoDatabazy);
var select = db.execute('SELECT * from annotations ORDER BY id DESC LIMIT 1');
while (select.isValidRow()) {
	featIdIn = 1 + select.fieldByName('id');
	select.next();
};
db.close();

//mapview.userLocation = true;
//mapview.userLocationButton = true;
//mapview.enableZoomControls = true;
////mapview.setMapToolbarEnabled(false);
////mapview.mapToolbarEnabled(false);
//mapview.mapType = MapModule.SATELLITE_TYPE;
//mapview.regionFit = true;

////mapview.addEventListener('longclick', function (evt) {
//	Ti.API.info("LAT: " + evt.latitude + " LON: " + evt.longitude);
//});

// ZOOMIN
//function zoomin(evt) {
//	//mapview.zoom(1);
//};

// LOADING DATA FROM DEVICE LOCAL DATABASE
function buttonLocalDataFunc(evt) {
	var db = Ti.Database.open(menoDatabazy);
	var select = db.execute('SELECT * from annotations WHERE mark_for_del=0');
	db.close();
	//mapview.removeAllAnnotations();
	$.index.setActiveTab(2);
	$.window2.add(activityIndicator);
	while (select.isValidRow()) {
		activityIndicator.show();
		Ti.API.info('id: ' + select.fieldByName('id'));
		Ti.API.info('gmlID: ' + select.fieldByName('gmlID'));
		Ti.API.info('lat: ' + select.fieldByName('lat'));
		Ti.API.info('lon: ' + select.fieldByName('lon'));
		Ti.API.info('featureType: ' + select.fieldByName('featureType'));
		//Ti.API.info('endpoint: ' + select.fieldByName('endpoint'));
		var gmlID = select.fieldByName('gmlID');
		var plnt_name = select.fieldByName('plnt_name');
		var photo = select.fieldByName('image');
		var obs_date = select.fieldByName('obs_date');
		var uid = select.fieldByName('uid');
		var uidText = uid.split("#");
		//var uidText = "TEST VEC";
		uidText = uidText[0];
		var crtn = select.fieldByName('crtn');
		var site_conf = select.fieldByName('site_conf');
		var site_descr = select.fieldByName('site_descr');

		var annotationColor = 'balloon_blue.png';
		if (uid == $.nicknameField.getValue()) {
			// my own annotation color
			var annotationColor = 'balloon_purple.png';
		}
		var annotationDB = (MapModule.createAnnotation({
				featIdIn : select.fieldByName('id'),
				image : annotationColor,
				latitude : select.fieldByName('lat'),
				longitude : select.fieldByName('lon'),
				gmlID : gmlID,
				plnt_name : plnt_name,
				photo : photo,
				obs_date : obs_date,
				site_conf : site_conf,
				site_descr : site_descr,
				uid : uid,
				crtn : crtn,
				title : plnt_name,
				subtitle : gmlID + "\n" + uidText
			}));
		//mapview.addAnnotation(annotationDB);
		
		var mojeID = select.fieldByName('id');
		var marker = annotationColor;
		var lon = select.fieldByName('lon');
		var lat = select.fieldByName('lat');
		//var vec = 'addAnnotation("'+mojeID+'","'+icon+'",'+lon+','+lat+',"'+plnt_name+'","'+gmlID+'","'+uidText+'");';
	    var vec = 'addAnnotation('+mojeID+','+lon+','+lat+',"'+marker+'");';
	    console.log("------------------------------------------");
	    console.log(vec);
	    console.log("------------------------------------------");
	    Ti.App.fireEvent('app:fromTitanium', { message: vec }); // LIFO FIFO
		select.next();	
	}
	Ti.App.fireEvent('app:fromTitanium', { message: 'removeAllAnnotations();' });
	activityIndicator.hide();
};

// HANDLING THE DEVICE COMPASS
var heading = 0;
function handleCompass(e) {
	//Ti.API.info(e.heading.magneticHeading);
	heading = e.heading.magneticHeading;

}
//ADD ANNOTATIONS BY GEOLOCATION
function addGPS(evt) {
	if (Ti.Geolocation.locationServicesEnabled) {
		Ti.Geolocation.purpose = 'Get Current Location';
		Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
		Ti.Geolocation.distanceFilter = 5;
		Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
	   Titanium.Geolocation.getCurrentPosition(function(e) {
	       if (e.error) {
	           Ti.API.error('Error: ' + e.error);
	       } else {
	           	// VARIABLES FOR INSERT INTO DB
	           	var lat = e.coords.latitude;
				var lon = e.coords.longitude;
				var alt = e.coords.altitude;
				var acc = e.coords.accuracy;
				var spe = e.coords.speed;
				var tim = e.coords.timestamp;
				var ala = e.coords.altitudeAccuracy;
				featureType = label.text.replace(/Selected feature: /g, "");

				var gmlID = 0;
				var plnt_name = 'Undefined';
				var photo = '';
				var obs_date = '';
				var uid = $.nicknameField.getValue();
				spl = uid.split("#");
				var uidText = spl[0];
				var crtn = '';
				var site_conf = '';
				var site_descr = '';
				// INSERT INTO DB
				endpoint = $.endpointURL.value;
				////mapview.selectAnnotation(annot1,true);
				var db = Ti.Database.open(menoDatabazy);
				//db.execute("INSERT INTO annotations (id, lat, lon, featureType, endpoint, gmlID) VALUES (" + featIdIn + "," + lat + "," + lon + ", '" + featureType + "', '" + endpoint + "', '" + 0 + "')");
				db.execute("INSERT INTO annotations (id, lat, lon, featureType, endpoint, gmlID, plnt_name, image, obs_date, uid, crtn, site_conf, site_descr) VALUES (" + featIdIn + "," + lat + "," + lon + ", '" + featureType + "', '" + endpoint + "', '" + 0 + "', '" + plnt_name + "', '" + photo + "', '" + obs_date + "','" + uid + "', '" + crtn + "', '" + site_conf + "', '" + site_descr + "' ) ");
				db.close();
				featIdIn = featIdIn + 1;
				buttonLocalDataFunc();
				var centerMap = 'zoomOnGPS('+lon+','+lat+');';
			    Ti.App.fireEvent('app:fromTitanium', { message: centerMap });
				

	       }
	   });
	} else {
	   alert('Please enable location services');
	}
	}
//LOCATE FUNCTION
function locate(evt) {
	if (Ti.Geolocation.locationServicesEnabled) {
		Ti.Geolocation.purpose = 'Get Current Location';
		Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
		Ti.Geolocation.distanceFilter = 5;
		Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
	   Titanium.Geolocation.getCurrentPosition(function(e) {
	       if (e.error) {
	           Ti.API.error('Error: ' + e.error);
	       } else {
	           	Ti.API.info(e.coords.latitude);
	           	Ti.API.info(e.coords.longitude);
	           	var lat = e.coords.latitude;
				var lon = e.coords.longitude;
				var alt = e.coords.altitude;
				var centerMap = 'showMyPosition('+lon+','+lat+');';
			    Ti.App.fireEvent('app:fromTitanium', { message: centerMap });
			    
	       }
	   });
	} else {
	   alert('Please enable location services');
	}
	}

//ADD ANNOTATIONS MANUALLY ON MAP
var manualModEnabled = 0; // toto je premenna vonku z fcie aby bola globalna
function modFciaOld(evt) {
	var lat = evt.latitude;
	var lon = evt.longitude;
	featureType = label.text.replace(/Selected feature: /g, "");
	var gmlID = 0;
	var plnt_name = 'Undefined';
	var photo = '';
	var obs_date = '';
	var uid = $.nicknameField.getValue();
	spl = uid.split("#");
	var uidText = spl[0];
	var crtn = '';
	var site_conf = '';
	var site_descr = '';

	var annotationMan = (MapModule.createAnnotation({
			featIdIn : featIdIn,
			image : 'balloon_orange.png',
			latitude : lat,
			longitude : lon,
			gmlID : gmlID,
			plnt_name : plnt_name,
			photo : photo,
			obs_date : obs_date,
			site_conf : site_conf,
			site_descr : site_descr,
			uid : uid,
			crtn : crtn,
			title : plnt_name,
			subtitle : "N/A\n" + uidText
		}));

	//mapview.addAnnotation(annotationMan);
	
	var marker = 'balloon_orange.png';
	var lon = lon;
	var lat = lat;
	var addAnnotationGPS = 'addAnnotation('+featIdIn+','+lon+','+lat+',"'+marker+'");';
	Ti.App.fireEvent('app:fromTitanium', { message: addAnnotationGPS }); // LIFO FIFO
	var centerMap = 'zoomOnGPS('+lon+','+lat+');';
	Ti.App.fireEvent('app:fromTitanium', { message: centerMap });


	endpoint = $.endpointURL.value;
	////mapview.selectAnnotation(annot1,true);
	var db = Ti.Database.open(menoDatabazy);
	//db.execute("INSERT INTO annotations (id, lat, lon, featureType, endpoint, gmlID) VALUES (" + featIdIn + "," + lat + "," + lon + ", '" + featureType + "', '" + endpoint + "', '" + 0 + "')");
	db.execute("INSERT INTO annotations (id, lat, lon, featureType, endpoint, gmlID, plnt_name, image, obs_date, uid, crtn, site_conf, site_descr) VALUES (" + featIdIn + "," + lat + "," + lon + ", '" + featureType + "', '" + endpoint + "', '" + 0 + "', '" + plnt_name + "', '" + photo + "', '" + obs_date + "','" + uid + "', '" + crtn + "', '" + site_conf + "', '" + site_descr + "' ) ");
	db.close();
	featIdIn = featIdIn + 1;
};

Ti.App.addEventListener('app:fromWebView2', function(e) {
		        // VARIABLES FOR INSERT INTO DB
	           	var lat = e.latitude;
				var lon = e.longitude;
				featureType = label.text.replace(/Selected feature: /g, "");
				var gmlID = 0;
				var plnt_name = 'Undefined';
				var photo = '';
				var obs_date = '';
				var uid = $.nicknameField.getValue();
				spl = uid.split("#");
				var uidText = spl[0];
				var crtn = '';
				var site_conf = '';
				var site_descr = '';
				// INSERT INTO DB
				endpoint = $.endpointURL.value;
				////mapview.selectAnnotation(annot1,true);
				var db = Ti.Database.open(menoDatabazy);
				//db.execute("INSERT INTO annotations (id, lat, lon, featureType, endpoint, gmlID) VALUES (" + featIdIn + "," + lat + "," + lon + ", '" + featureType + "', '" + endpoint + "', '" + 0 + "')");
				db.execute("INSERT INTO annotations (id, lat, lon, featureType, endpoint, gmlID, plnt_name, image, obs_date, uid, crtn, site_conf, site_descr) VALUES (" + featIdIn + "," + lat + "," + lon + ", '" + featureType + "', '" + endpoint + "', '" + 0 + "', '" + plnt_name + "', '" + photo + "', '" + obs_date + "','" + uid + "', '" + crtn + "', '" + site_conf + "', '" + site_descr + "' ) ");
				db.close();
				featIdIn = featIdIn + 1;
				buttonLocalDataFunc();
				var centerMap = 'zoomOnGPS('+lon+','+lat+');';
			    Ti.App.fireEvent('app:fromTitanium', { message: centerMap });	
});

function addManually(evt) {

	////mapview.setCenter([0,0]);

	if (manualModEnabled == 1) {
		// tu je mod zapaty, spravit veci kere ma button spravit okrem vypnutia modu, tu treba zmenit vypnut mod lebo je zapaty, a zmenit meno buttonu
		$.addManually.setTitle("INSERT");
		manualModEnabled = 0;
		var insertDisable = 'insertDisable();';
		Ti.App.fireEvent('app:fromTitanium', { message: insertDisable });
		//mapview.removeEventListener('longclick', modFcia);
	} else {
		// tu je mod vypaty (by default)
		// clicknes a zmenis meno a zapnes mod
		$.addManually.setTitle("CANCEL");
		manualModEnabled = 1;
		var insertEnable = 'insertEnable();';
		Ti.App.fireEvent('app:fromTitanium', { message: insertEnable });
		//mapview.addEventListener('longclick', modFcia);
	}
};

//GET FEATURES LIST FROM WFS GET CAPABILITIES
var databuttonRetrieveDatasets = [];
var databuttonRetrieveDatasetsLocal = [];
function buttonRetrieveDatasetsFunc() {
	isOnline = Titanium.Network.getOnline();

	var endpoint = $.endpointURL.getValue();

	if (isOnline) {
		var url = endpoint + '?service=WFS&version=2.0.0&request=GetCapabilities';
		var xhr = Ti.Network.createHTTPClient();
		try {
			xhr.onload = function () {
				// Data is returned from the xhr
				var doc = this.responseXML.documentElement;
				// begin looping
				var items = doc.getElementsByTagName("FeatureType");
				//Ti.API.info(JSON.stringify(items));


				databuttonRetrieveDatasets = [];
				var db = Ti.Database.open(menoDatabazy);

				db.execute("DELETE FROM featureTypes WHERE endpoint='" + endpoint + "' ");
				

				for (var i = 0; i < items.length; i++) {
					var featureType = items.item(i).getElementsByTagName("Name").item(0).textContent;
					databuttonRetrieveDatasets[i] = featureType;
					db.execute("INSERT INTO featureTypes (endpoint, featureType) VALUES ('" + endpoint + "', '" + featureType + "')");
				}
				buttonSelectDataset();
				db.close();

				//buttonSelectDataset.show();
				//$.buttonAddToMap.hide();
				label.text = "proplant:obs_all"; // this is default value for selection
				label.show();
			};
			xhr.onerror = function (e) {
				// should do something more robust
				alert('Whoops...something is wrong check URL you entered. Error details: ' + e.error);
			};
			xhr.open('GET', url);
			xhr.send();
		} catch (e) {
			alert(e);
		}
	} else {
		// OFFLINE MODE - FROM LOCAL DB
		alert("WARNING: you are in offline mode, loading local database...");
		databuttonRetrieveDatasetsLocal = [];

		var db = Ti.Database.open(menoDatabazy);
		var select = db.execute("SELECT * from featureTypes WHERE endpoint='" + endpoint + "' ORDER BY featureType");
		db.close();
		Ti.API.info('GEO APP: Loading endpoints from local db');
		var i = 0;
		while (select.isValidRow()) {
			databuttonRetrieveDatasetsLocal[i] = select.fieldByName('featureType');
			select.next();
			i++;
		}
		buttonSelectDataset();
		//buttonSelectDataset.show();
		//$.buttonAddToMap.hide();
		label.text = "proplant:obs_all"; // this is default value for selection
		label.show();

	};
	

};

//GET FEATURE FOR SELECTED FEATURE TYPE
function buttonAddToMapFunc() {
	value = label.text.replace(/Selected feature: /g, "");
	//var selectedIndex = evt.source.selectedIndex;
	var data = [];
	var endpoint = $.endpointURL.getValue();
	var url = endpoint + '?service=WFS&version=2.0.0&request=GetFeature&typeName=' + value + '&srsName=EPSG:4326&outputFormat=application/json';
	isOnline = Titanium.Network.getOnline();
	if (isOnline) {
		var xhr = Ti.Network.createHTTPClient();
		try {
			xhr.onreadystatechange = function () {

				if (xhr.readyState == 4) {
					if (xhr.status == 200) {
						activityIndicator.hide();
						var res = xhr.responseText;
						//Ti.API.info(res);
						try {
							var obj = JSON.parse(res);

						} catch (e) {
							alert('NO VALID JSON');
							Ti.API.info(url);
						}

						pocet = 0;
						try {
							pocet = obj.totalFeatures;
						} catch (e) {}

						var pocetLimit = 1000000;
						if (pocet > 100) {
							pocetLimit = 100;
							alert("WARNING: too many results, only first 100 will be added to map");
						}

						var vyfailovalo = 0;
						//mapview.removeAllAnnotations();

						for (var i = 0; i < pocet; i++) {
							var gmlID = 0;
							//Ti.API.info("ANNOTATION LOOP #"+i);

							// ANNOTATIONS FOR POINT TYPE
							if (obj.features[0].geometry.type == 'Point') {
								//alert ("OK");
								//Ti.API.info("==> ANNOTATION TYPE POINT");
								var lon = obj.features[i].geometry.coordinates[0];
								var lat = obj.features[i].geometry.coordinates[1];
								var gmlID = obj.features[i].id;
								//Ti.API.info(lat + '\n' + lon);

								if (i < pocetLimit) {
									var annotationWFS = (MapModule.createAnnotation({
											class : annotations,
											image : 'balloon_brown.png',
											latitude : lat,
											longitude : lon,
											title : gmlID,
											rightView : Ti.UI.createButton({
												title : 'EDIT',
												id : 'editButtonFeature'
											})
										}));
									//mapview.addAnnotation(annotationWFS);
								}

								//break;
							}
							// ANNOTATIONS FOR MULTIPOINT TYPE
							else if (obj.features[0].geometry.type == 'MultiPoint') {
								//Ti.API.info("==> ANNOTATION TYPE MULTI POINT");
								var lon = obj.features[i].geometry.coordinates[0][0];
								var lat = obj.features[i].geometry.coordinates[0][1];
								var gmlID = obj.features[i].id;
								var plnt_name = obj.features[i].properties.plnt_name;
								var photo = obj.features[i].properties.image;
								var obs_date = obj.features[i].properties.obs_date;
								var uid = obj.features[i].properties.uid;
								var crtn = obj.features[i].properties.crtn;
								var site_conf = obj.features[i].properties.site_conf;
								var site_descr = obj.features[i].properties.site_descr;
								//Ti.API.info(lat + '\n' + lon);
								if (i < pocetLimit) {
									//var uid = $.nicknameField.getValue();
									spl = uid.split("#");
									var uidText = spl[0];

									var annotationWFS = (MapModule.createAnnotation({
											featIdIn : featIdIn,
											image : 'balloon_blue.png',
											backgroundColor : '#B9E0AE',
											borderWidth : "2",
											borderColor : "#283618",
											borderRadius : "5",
											latitude : lat,
											longitude : lon,
											gmlID : gmlID,
											plnt_name : plnt_name,
											photo : photo,
											obs_date : obs_date,
											site_conf : site_conf,
											site_descr : site_descr,
											uid : uid,
											crtn : crtn,
											title : plnt_name,
											subtitle : gmlID + "\n" + uidText
										}));
									//mapview.addAnnotation(annotationWFS);
								}

							} else {
								//Ti.API.info("==> ANNOTATION TYPE ERROR");
								vyfailovalo += 1;
								//alert("CURRENT VERSION SUPPORTS ONLY POINT GEOMETRY TYPES");
								break;
							}

							//Ti.API.info(db.getFile().nativePath);

							// mame to uz v db?
							var db = Ti.Database.open(menoDatabazy);

							//Ti.API.info("========================================================");
							Ti.API.info("AddtoMapButton: SELECT * from annotations WHERE gmlID='" + gmlID + "'");

							var select = db.execute("SELECT * from annotations WHERE gmlID='" + gmlID + "'");
							if (select.rowCount) {
								// update v db


								// TODO: VYRIESIT ZE CO SA MA STAT
								// teraz sa updatne datami z internetu lokalna databaza
								// co ak je v GEOSERVERI iny udaj ako mame v lokal DB?

								db.execute("UPDATE annotations SET lat=" + lat + ", lon=" + lon + ", featureType='" + value + "', endpoint='" + endpoint + "', plnt_name='" + plnt_name + "', image='" + photo + "', obs_date='" + obs_date + "', uid='" + uid + "', crtn='" + crtn + "', site_conf='" + site_conf + "', site_descr='" + site_descr + "', mark_for_del=0, mark_for_push=0 WHERE gmlID='" + gmlID + "' ");
							} else {
								// insert do db
								db.execute("INSERT INTO annotations (id, lat, lon, featureType, endpoint, gmlID, plnt_name, image, obs_date, uid, crtn, site_conf, site_descr) VALUES (" + featIdIn + "," + lat + "," + lon + ", '" + value + "', '" + endpoint + "', '" + gmlID + "', '" + plnt_name + "', '" + photo + "', '" + obs_date + "','" + uid + "', '" + crtn + "', '" + site_conf + "', '" + site_descr + "' ) ");
								featIdIn += 1;

							}
							db.close();
							lon = null;
							lat = null;
							gmlID = null;
							annotationWFS = null;
							db = null;
							select = null;
						}

						if (vyfailovalo > 0) {
							//alert("CURRENT VERSION SUPPORTS ONLY POINT GEOMETRY TYPES, "+vyfailovalo+" FAILED OUT OF "+pocet+" ANOTATIONS IMPORTED");
							alert("CURRENT VERSION SUPPORTS ONLY POINT GEOMETRY TYPES");

						} else {
							$.index.setActiveTab(2);
						}
					}
				}
			};
			xhr.onerror = function (e) {
				// should do something more robust
				alert('Whoops...something is wrong check URL you entered. Error details: ' + e.error);
			};
			xhr.open('GET', url, true);
			activityIndicator.show();

			xhr.send();
		} catch (e) {
			alert("There was network error: " + e);
		}
	} else {
		alert("There was network error");
	}
};

//
// BASIC OPTIONS DIALOG
//

var optionsDialogOpts = {
	destructive : 1,
	cancel : 2,
	title : 'Choose FeatureType'
};

if (isAndroid) {
	optionsDialogOpts.selectedIndex = 0;
}

var dialog = Titanium.UI.createOptionDialog(optionsDialogOpts);

// add event listener
dialog.addEventListener('click', function (e) {
	// KLIK VNUTRI NA SELEKTOVANY RIADOK
	if (e.button) {
		// label.text = ' button';
	} else {
		//$.buttonAddToMap.show();
		isOnline = Titanium.Network.getOnline();
		if (isOnline) {
			label.text = 'Selected feature: ' + databuttonRetrieveDatasets[e.index];
		} else {
			label.text = 'Selected feature: ' + databuttonRetrieveDatasetsLocal[e.index];
		}
		buttonAddToMapFunc();
	}

});
/*
var buttonSelectDataset = Titanium.UI.createButton({
		title : 'Select Dataset',
		//height:40,
		//top:150
		backgroundColor : "#283618",
		width : "30%",
		top : "15%",
		left : "5%"
	});
*/

//buttonSelectDataset.addEventListener('click', function () {
// FUNCTION TO FILL THE DIALOG OF THE DATA LIST
function buttonSelectDataset(){
	// KLIK NA DRUHY BUTTON
	dialog.title = 'Select feature:';

	isOnline = Titanium.Network.getOnline();
	if (isOnline) {
		// tu naplname dataList - ONLINE
		dialog.options = databuttonRetrieveDatasets;
		dialog.destructive = 0;
		dialog.cancel = 3;
		if (isAndroid) {
			dialog.androidView = null;
			dialog.buttonNames = ['Cancel'];
		}
		dialog.show();
	} else {
		// tu naplname dataList - OFFLINE
		if (databuttonRetrieveDatasetsLocal.length < 1) {
			alert("No local data found! No internet connection found! Cannot load data...");

		} else {
			dialog.options = databuttonRetrieveDatasetsLocal;
			alert("Using local data!");
			dialog.destructive = 0;
			dialog.cancel = 3;
			if (isAndroid) {
				dialog.androidView = null;
				dialog.buttonNames = ['Cancel'];
			}
			dialog.show();
		}
	}
};

// label that shows clicked option
var label = Titanium.UI.createLabel({
		text : 'proplant:obs_all',
		color : '#999',
		font : {
			fontFamily : 'Helvetica Neue',
			fontSize : 15
		},
		textAlign : 'center',
		top : '30%',
		width : '100%'
	});

//$.window1.add*()
//$.window1.add(buttonSelectDataset);
$.window1.add(label);

//buttonSelectDataset.hide();
label.hide();
//$.buttonAddToMap.hide();

// DIALOG LIST OF OPTIONS FOR CERTAINITY TEXTFIELD IN THE EDITINGFORM

var certainityOptions = ['high', 'medium', 'low', 'unknown'];

var optsCertainity = {
	cancel : 2,
	options : certainityOptions,
	selectedIndex : 3,
	destructive : 0,
	title : 'Select value:'
};

var dialogCertainity;

function eventListCrtn(e) {
	dialogCertainity = Ti.UI.createOptionDialog(optsCertainity);
	dialogCertainity.show();
	dialogCertainity.addEventListener('click', onSelectDialogCertainity);
}

function onSelectDialogCertainity(event) {
	var selectedIndex = event.source.selectedIndex;
	//OR
	//var selectedIndex = dialogCertainity.selectedIndex();
	//alert('You have selected' + certainityOptions[selectedIndex ]);
	$.certainityField.setValue(certainityOptions[selectedIndex]);
}

// DIALOG LIST OF OPTIONS FOR SITE CONFIGURATION TEXTFIELD IN THE EDITINGFORM

var siteConfOptions = ['in groups', 'single plant'];

var optsSiteConf = {
	cancel : 2,
	options : siteConfOptions,
	selectedIndex : 3,
	destructive : 0,
	title : 'Select value:'
};

var dialogSiteConf;

function eventSiteConf(e) {
	dialogSiteConf = Ti.UI.createOptionDialog(optsSiteConf);
	dialogSiteConf.show();
	dialogSiteConf.addEventListener('click', onSelectDialogSiteConf);
}

function onSelectDialogSiteConf(event) {
	var selectedIndex = event.source.selectedIndex;
	//OR
	//var selectedIndex = dialogCertainity.selectedIndex();
	//alert('You have selected' + certainityOptions[selectedIndex ]);
	$.siteConfField.setValue(siteConfOptions[selectedIndex]);
}



// LAUNCHING CAMERA AND FILLING THE FILE NAME

function eventListenerCamera(e) {
	if ($.imageField.getValue() == '')
	{
	var _picsTaken = 0;
	var timer = {};
	Titanium.Media.showCamera({
		saveToPhotoGallery : true,
		allowEditing : false,
		autohide : false, //Important!

		success : function (event) {
			$.imageField.setValue(event.media.file.name);
			},
		error : function (error) {
			var a = Titanium.UI.createAlertDialog({
					title : 'Camera'
				});
			if (error.code == Titanium.Media.NO_CAMERA || error.code == Titanium.Media.NO_VIDEO) {
				a.setMessage(L('no_camera'));
			} else {
				a.setMessage('Unexpected error: ' + error.code);
			}
			a.show();
		}
	});
	setTimeout(function () {
		Ti.Media.takePicture();
	}, 500);	
	}
else {
	
			var imageFile = Ti.Filesystem.getFile('file:///storage/emulated/0/Pictures/proplant/', $.imageField.getValue());
		var cameraImageView = Ti.UI.createImageView({
			width:"95%",
			height:"95%",
			top:"2.5%",
			left:"2.5%",
			image:imageFile
			});
		$.window3.add(cameraImageView);	
		var buttonCameraImageViewClose = Ti.UI.createButton({
			title : 'Close',
			backgroundColor : "#283618",
			width : "30%",
			bottom : "5%",
			left : "5%"
		});
		$.window3.add(buttonCameraImageViewClose);
		
		var buttonCameraImageViewNew = Ti.UI.createButton({
			title : 'New',
			backgroundColor : "#283618",
			width : "30%",
			bottom : "5%",
			right : "5%"
		});
		$.window3.add(buttonCameraImageViewNew);
		
		buttonCameraImageViewClose.addEventListener('click', function()
		{
			$.window3.remove(cameraImageView);
			$.window3.remove(buttonCameraImageViewClose);
			$.window3.remove(buttonCameraImageViewNew);
		});
		
		buttonCameraImageViewNew.addEventListener('click', function()
			{
				$.window3.remove(cameraImageView);
				$.window3.remove(buttonCameraImageViewClose);
				$.window3.remove(buttonCameraImageViewNew);
				var _picsTaken = 0;
				var timer = {};
				Titanium.Media.showCamera({
					saveToPhotoGallery : true,
					allowEditing : false,
					autohide : false, //Important!
			
					success : function (event) {
						$.imageField.setValue(event.media.file.name);
						},
					error : function (error) {
						var a = Titanium.UI.createAlertDialog({
								title : 'Camera'
							});
						if (error.code == Titanium.Media.NO_CAMERA || error.code == Titanium.Media.NO_VIDEO) {
							a.setMessage(L('no_camera'));
						} else {
							a.setMessage('Unexpected error: ' + error.code);
						}
						a.show();
					}
				});
				setTimeout(function () {
					Ti.Media.takePicture();
				}, 500);	
		
			});
		}	
}		
		
// DATE PICKER FOR FIELD OBSERVATION DATE

var picker = Ti.UI.createPicker({});

var txt = Ti.UI.createTextField({
		value : '',
		borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
		editable : false,
		width : 300
	});

function eventListDatePicker(e) {
	picker.showDatePickerDialog({
		value : new Date(), // some date
		callback : function (e) {
			if (e.cancel) {
				Ti.API.info('user canceled dialog');
			} else {
				Ti.API.info('value is: ' + e.value);

				Ti.API.info('lets see what this object is' + JSON.stringify(e));
				vec = JSON.stringify(e);
				selectedDate = JSON.parse(vec);

				selectedDate = selectedDate.value.split("T");
				selectedDate = selectedDate[0];
				//$.dateField.setValue(String.formatDate(selectedDate, 'YYYY-MM-DD'));
				$.dateField.setValue(selectedDate);
			}
		}
	});

}
//$.dateField.addEventListener('dblclick',eventListDatePicker );

// LOADING PROTECTED PLANTS LIST FROM LOCAL JSON FILE

var fileName = '/data/plantlist_latin.json';
var file = Titanium.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, fileName);
var json, protectedPlants, plant, latin, national;
var preParseData = (file.read().text);
var response = JSON.parse(preParseData);
Ti.API.info('latin0 = ' + response.protectedPlants.plant[0].latin);
Ti.API.info('national0 = ' + response.protectedPlants.plant[0].national);

var plntCount = response.protectedPlants.plant;
var dataListPlantLatinName = [];
for (var i = 0; i < plntCount.length; i++) {
	//Ti.API.info([i] + '. latin = ' + response.protectedPlants.plant[i].latin);
	//Ti.API.info([i] + '. national = ' + response.protectedPlants.plant[i].national);
	var plantLatinName = response.protectedPlants.plant[i].latin;
	dataListPlantLatinName[i] = plantLatinName;
}

// DIALOG LIST OF OPTIONS FOR PLANT LATIN NAMES
var optsPlantName = {
	cancel : 2,
	options : dataListPlantLatinName,
	selectedIndex : 0,
	destructive : 0,
	title : 'Select value:'
};

var dialogPlantName;

function eventListPlantsList() {
	dialogPlantName = Ti.UI.createOptionDialog(optsPlantName);
	dialogPlantName.show();
	dialogPlantName.addEventListener('click', onSelectDialogPlantName);
}
//$.plntNameField.addEventListener('click',eventListPlantsList);

function onSelectDialogPlantName(event) {
	var selectedIndex = event.source.selectedIndex;
	//OR
	//var selectedIndex = dialogPlantName.selectedIndex();
	//alert('You have selected' + certainityOptions[selectedIndex ]);
	$.plntNameField.setValue(dataListPlantLatinName[selectedIndex]);
}

/*


// AUTOCOMPLETE ON PLANT NAME FIELD

//var searchArray = ['apple','orange','lemon'];

//Table view showing your autocomplete values
var tblvAutoComplete = Ti.UI.createTableView({
width           : '90%',
backgroundColor : '#EFEFEF',
height          : 0,
maxRowHeight    : 35,
minRowHeight    : 35,
allowSelection  : true
});
$.window3.add(tblvAutoComplete);
//Starts auto complete
$.plnNameField.addEventListener('change', function(e){
var pattern = e.source.value;
var tempArray = PatternMatch(searchArray, pattern);
CreateAutoCompleteList(tempArray);
});
//You got the required value and you clicks the word
tblvAutoComplete.addEventListener('click', function(e){
$.plnNameField.setValue(e.rowData.result);
});

//Returns the array which contains a match with the pattern
function PatternMatch(arrayToSearch, pattern){
var searchLen = pattern.length;
arrayToSearch.sort();
var tempArray = [];
for(var index = 0, len = arrayToSearch.length; index< len; index++){
if(arrayToSearch[index].substring(0,searchLen).toUpperCase() === pattern.toUpperCase()){
tempArray.push(arrayToSearch[index]);
}
}
return tempArray;
}
//setting the tableview values
function CreateAutoCompleteList(searchResults){
var tableData = [];
for(var index=0, len = searchResults.length; index < len; index++){

var lblSearchResult = Ti.UI.createLabel({
top            : 2,
width          : '40%',
height         : 34,
left           : '5%',
font           : { fontSize : 14 },
color          : '#000000',
text           : searchResults[index]
});

//Creating the table view row
var row = Ti.UI.createTableViewRow({
backgroundColor : 'transparent',
focusable       : true,
height          : 50,
result          : searchResults[index]
});

row.add(lblSearchResult);
tableData.push(row);
}
tblvAutoComplete.setData(tableData);
tblvAutoComplete.height = tableData.length * 35;
}

 */

//LOGIN FUNCTION

var loginInstance;

try {

	$.buttonLogin.removeEventListener(loginInstance);
} catch (e) {}

$.buttonLogin.addEventListener('click', function loginInstance() {
	var url = 'http://bolegweb.geof.unizg.hr/proplant/api/login.php';
	var xhr = Ti.Network.createHTTPClient();
	try {
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					activityIndicator.hide();
					var res = xhr.responseText;
					Ti.API.info(res);
					try {
						var obj = JSON.parse(res);

						if (obj.error) {
							alert(obj.error);
						} else {
							$.nicknameField.setValue(obj.user + '#' + obj.uid);
							alert('Sucessfully logged in. Your nickname is: ' + obj.user + '#' + obj.uid);
							$.nicknameField.setEditable('false');
							Ti.App.Properties.setString('myNickname', obj.user + '#' + obj.uid);
							$.buttonLogout.show();
						}

					} catch (e) {
						alert('NO VALID JSON');
						Ti.API.info(url);
						Ti.API.info(xhr.responseText);
					}
				}
			}
		};
		xhr.onerror = function (e) {
			// should do something more robust
			alert('Whoops...something is wrong check URL you entered. Error details: ' + e.error);
		};
		xhr.open('GET', url, true);

		var params = {
			user : $.nicknameField.getValue()
		};

		xhr.send(params);
	} catch (e) {
		alert(e);
	}

	return this;
});

//LOG OUT FUNCTIO
function logout() {
	$.nicknameField.setValue('');
	$.nicknameField.setEditable('true');
	alert('YOU LOGGED OUT');
	$.buttonLogout.hide();

}

function eventListMarkForDel() {

	var db = Ti.Database.open(menoDatabazy);
	if (currentGML == 0) {
		db.execute("DELETE FROM annotations WHERE id='" + currentFeatIdIn + "'");
	} else {
		db.execute("UPDATE annotations SET mark_for_del='1', mark_for_push=0 WHERE gmlID='" + currentGML + "' ");
	}
	db.close();
	buttonLocalDataFunc();
};

function formatString(str, arr) {
	return str.replace(/%(\d+)/g, function (_, m) {
		return arr[--m];
	});
}


// nickname from config to teztFIELD
var myNickname = Ti.App.Properties.getString('myNickname', 'DEMO#0');
$.nicknameField.setValue(myNickname);
$.buttonLogout.hide();

// PUSH INFO LABEL CONTENT

function loaderViewDataFunc() {
	var pushText = '';
	var pushCount = 0;

	var db = Ti.Database.open(menoDatabazy);

	//var sqlString = db.execute("SELECT * from annotations WHERE mark_for_push = 1 OR mark_for_del = 1 OR gmlID = 0");
	var qdel = db.execute("SELECT * from annotations WHERE mark_for_del = 1");
	if (qdel.rowCount > 0) {

		//alert("TEST1");
		//Ti.API.info('ROW COUNT FOR DELETE: ' + qdel.rowCount);
		pushText += 'You have ' + qdel.rowCount + ' records in local DB to be deleted. \n';
		pushCount += qdel.rowCount;
	};
	var qnew = db.execute("SELECT * from annotations WHERE gmlID = 0");
	if (qnew.rowCount > 0) {
		//Ti.API.info('ROW COUNT FOR NEW: ' + qnew.rowCount);
		pushText += 'You have ' + qnew.rowCount + ' records in local DB to be inserted. \n';
		pushCount += qnew.rowCount;
	};
	var qupd = db.execute("SELECT * from annotations WHERE mark_for_push = 1 AND mark_for_del = 0 AND gmlID!=0");
	if (qupd.rowCount > 0) {
		pushText += 'You have ' + qupd.rowCount + ' records in local DB to be updated. \n';
		pushCount += qupd.rowCount;
	};
	db.close();
	if (pushText.length < 1) {
		pushText = 'You have 0 items to push to the Proplant Data Store';
		$.buttonDontPushData.hide();
		$.buttonPushData.hide();
	} else {
		$.buttonDontPushData.show();
		$.buttonPushData.show();

	}
	$.pushInfoLabel.setText(pushText);
}
loaderViewDataFunc();


function buttonPushDataFunc() {
	
	//alert ('PUSHED PUSH DATA BUTTON');
	var dialog = Ti.UI.createAlertDialog({
			cancel : 1,
			buttonNames : ['Confirm', 'Cancel'],
			message : 'Confirm or cancel?',
			title : 'Push edits?'
		});
		
		
		
	dialog.addEventListener('click', function (e) {
		var toRefresh = 0;
		Ti.API.info("toRefresh goes to ZERO");
	
		if (e.index === e.source.cancel) {
			Ti.API.info('The cancel button was clicked');
		} else {
			
			
			/*
			 * TO BE DELETED PART
			 */

			// to be deleted = collect
			
			var tbd = [];
			var tbdi = 0;
			var db = Ti.Database.open(menoDatabazy);
			var select = db.execute("SELECT * FROM annotations WHERE mark_for_del=1");
			db.close();
			while (select.isValidRow()) {
				spl = select.fieldByName('gmlID').split(".");
				var iid = spl[1];
				var delID = select.fieldByName('id');
				//var db = Ti.Database.open(menoDatabazy);
				//db.execute("DELETE FROM annotations WHERE id='" + delID + "'");
				//db.close();
				tbd.push(iid);
				select.next();
				tbdi++;
				i++;
			}

			if (tbdi) {
				// to be deleted = do it!
				var url = 'http://bolegweb.geof.unizg.hr/proplant/api/push_del.php';
				var xhr = Ti.Network.createHTTPClient();
				try {
					xhr.onreadystatechange = function () {
						if (xhr.readyState == 4) {
							if (xhr.status == 200) {
								activityIndicator.hide();
								var res = xhr.responseText;
								Ti.API.info(res);
								var obj = 0;
								try {
									obj = JSON.parse(res);

									Ti.API.info(JSON.stringify(obj));

								} catch (e) {
									alert('NO VALID JSON (delete)');
									Ti.API.info(url);
									Ti.API.info(xhr.responseText);
								}

								if (obj != 0) {
									//alert('XHR passed...');
									if (obj == "deletedOK") {
										var db = Ti.Database.open(menoDatabazy);
										db.execute('DELETE FROM annotations WHERE mark_for_del = 1');
										db.close();
										//loaderViewDataFunc();
										Ti.API.info("toRefresh if is true");
										buttonAddToMapFunc();
										loaderViewDataFunc();
										//alert("INSERT OK");
									} else {
										alert('You are offline or our server is unreachable, please retry later.');
									}
								}
							}
						}
					};
					xhr.onerror = function (e) {
						// should do something more robust
						alert('You are offline or our server is unreachable, please retry later.');
					};
					xhr.open('POST', url, true);

					strTBD = JSON.stringify(tbd);
					var params = {
						user : $.nicknameField.getValue(),
						tbd : strTBD
					};

					xhr.send(params);
				} catch (e) {
					alert(e);
				}
			}

			/*
			 * TO BE UPDATED PART
			 */

			// to be udpated = collect markForPush
			var tbd = [];
			var tbdi = 0;
			var db = Ti.Database.open(menoDatabazy);
			var select = db.execute("SELECT * FROM annotations WHERE mark_for_push=1 AND gmlID!=0");
			while (select.isValidRow()) {
				spl = select.fieldByName('gmlID').split(".");
				var iid = spl[1];
				//var updID = select.fieldByName('id');
				//db.execute("DELETE FROM annotations WHERE id='" + updID + "'");
				var tbdfields = [];
				for (loopI = 0; loopI < select.fieldCount; loopI++) {
					tbdfields.push(select.field(loopI)); // UMRELI DO RANA
				}
				//Ti.API.info("==================TBD FIELDS ===========================");
				//Ti.API.info(JSON.stringify(tbdfields));
				tbd.push(JSON.stringify(tbdfields));
				select.next();
				tbdi++;
				i++;
			}
			db.close();

			if (tbdi) {
				// to be updated = do it!
				var url = 'http://bolegweb.geof.unizg.hr/proplant/api/push_upd.php';
				var xhr = Ti.Network.createHTTPClient();
				try {
					xhr.onreadystatechange = function () {
						if (xhr.readyState == 4) {
							if (xhr.status == 200) {
								activityIndicator.hide();
								var res = xhr.responseText;
								Ti.API.info(res);
								var obj = 0;
								try {
									obj = JSON.parse(res);

									Ti.API.info("========================================================");
									Ti.API.info(JSON.stringify(obj));

								} catch (e) {
									alert('NO VALID JSON (update)');
									Ti.API.info(url);
									Ti.API.info(xhr.responseText);
								}

								if (obj != 0) {
									//alert(obj);
									if (obj == "updatedOK") {
										var db = Ti.Database.open(menoDatabazy);
										db.execute('DELETE FROM annotations WHERE mark_for_push = 1');
										db.close();
										//loaderViewDataFunc();
										Ti.API.info("toRefresh if is true");
										buttonAddToMapFunc();
										loaderViewDataFunc();
										//alert("INSERT OK");
										
									} else {
										alert('You are offline or our server is unreachable, or there was an error during DB update, please retry later, or ocntact app administrator.');
									}
								}
							}
						}
					};
					xhr.onerror = function (e) {
						// should do something more robust
						alert('You are offline or our server is unreachable, please retry later.');
					};
					xhr.open('POST', url, true);

					strTBD = JSON.stringify(tbd);
					var params = {
						user : $.nicknameField.getValue(),
						tbd : strTBD
					};

					xhr.send(params);
				} catch (e) {
					alert(e);
				}
			}
			
			/*
			 * TO BE INSERTED PART
			 */

			// to be isnerted = collect markForPush
			var tbd = [];
			var tbdi = 0;
			var db = Ti.Database.open(menoDatabazy);
			var select = db.execute("SELECT * FROM annotations WHERE gmlID=0");
			while (select.isValidRow()) {
				spl = select.fieldByName('gmlID').split(".");
				var iid = spl[1];
				//var insID = select.fieldByName('id');
				//db.execute("DELETE FROM annotations WHERE id='" + insID + "'");
				var tbdfields = [];
				for (loopI = 0; loopI < select.fieldCount; loopI++) {
					tbdfields.push(select.field(loopI)); // UMRELI DO RANA
				}
				
				//Ti.API.info("==================INSERT FIELDS ===========================");
				//Ti.API.info(JSON.stringify(tbdfields));
				
				tbd.push(JSON.stringify(tbdfields));
				select.next();
				tbdi++;
				i++;
			}
			db.close();
			
			if (tbdi) {
				// to be inserted = do it!
				var url = 'http://bolegweb.geof.unizg.hr/proplant/api/push_ins.php';
				var xhr = Ti.Network.createHTTPClient();
				try {
					xhr.onreadystatechange = function () {
						if (xhr.readyState == 4) {
							if (xhr.status == 200) {
								activityIndicator.hide();
								var res = xhr.responseText;
								Ti.API.info(res);
								var obj = 0;
								try {
									obj = JSON.parse(res);

									//Ti.API.info("========================================================");
									//Ti.API.info(JSON.stringify(obj));

								} catch (e) {
									alert('NO VALID JSON (insert)');
									Ti.API.info("========================================================");
									Ti.API.info(url);
									Ti.API.info(xhr.responseText);
								}

								if (obj != 0) {
									//alert(obj);
									//Ti.API.info("========================================================");
									//Ti.API.info(url);
									//Ti.API.info(xhr.responseText);
									
									if (obj == "insertOK") {
										//alert("INSERT OK")
										var db = Ti.Database.open(menoDatabazy);
										db.execute('DELETE FROM annotations WHERE gmlID = 0');
										db.close();
										//loaderViewDataFunc();
										
										Ti.API.info("toRefresh if is true");
										buttonAddToMapFunc();
										loaderViewDataFunc();
										//alert("INSERT OK");
										
									} else {
										alert('You are either offline or our server is unreachable, or there was an error during DB update, please retry later, or ocntact app administrator.');
									}
									
								}
							}
						}
					};
					xhr.onerror = function (e) {
						// should do something more robust
						alert('You are offline or our server is unreachable, please retry later.');
					};
					xhr.open('POST', url, true);

					strTBD = JSON.stringify(tbd);
					var params = {
						user : $.nicknameField.getValue(),
						tbd : strTBD
					};

					xhr.send(params);
				} catch (e) {
					alert(e);
				}
			}
			
		}
		
	});
	dialog.show();
}

function buttonDontPushDataFunc() {

	var dialog = Ti.UI.createAlertDialog({
			cancel : 1,
			buttonNames : ['Yes', 'No'],
			message : 'Do you want to discard your edits?',
			title : 'Discarting your edits...'
		});
	dialog.addEventListener('click', function (e) {
		if (e.index === e.source.cancel) {
			Ti.API.info('The discard button was clicked');
		} else {
			//alert ('PUSHED DONT PUSH DATA BUTTON');
			var db = Ti.Database.open(menoDatabazy);
			db.execute('UPDATE annotations SET mark_for_push = 0, mark_for_del = 0');
			db.execute('DELETE from annotations WHERE gmlID= 0');
			db.close();
			loaderViewDataFunc();
		}
	});
	dialog.show();

}

try {
	$.buttonPushData.removeEventListener('click', buttonPushDataFunc);
} catch (e) {}
$.buttonPushData.addEventListener('click', buttonPushDataFunc);

try {
	$.buttonDontPushData.removeEventListener('click', buttonDontPushDataFunc);
} catch (e) {}
$.buttonDontPushData.addEventListener('click', buttonDontPushDataFunc);

//$.window1.activity.actionBar.hide();
$.window1.add(activityIndicator);

$.index.open();

$.index.addEventListener("open", function() {
		
	// create web view depending on API level
	/*
	if(apiLevel < 19)
	{
		var myURL = '/HTML/leaflet/index.html';
	}
	else
	{
		var myURL ='/HTML/openlayers/index.html';
	}
	*/
	var webView = Ti.UI.createWebView({
        left : 0,
        top : 0,
        right : 0,
        bottom : 0,
        width: '100%',
        height: '100%',
        borderRadius: 1,
        enableZoomControls : false, // Android only
        url : '/HTML/openlayers/index.html',
        setWebContentsDebuggingEnabled: true
    });

	$.window2.add(webView);
	
	Ti.App.addEventListener('app:fromWebView', function(e) {
		//console.log("");
		var db = Ti.Database.open(menoDatabazy);
		var select = db.execute('SELECT * from annotations WHERE id='+e.message);
		db.close();
		if(! select.rowCount)
		{
			alert("neznama chyba: SELECT * from annotations WHERE id="+e.message);
			return;
		}
		else{
			alert("bez chyby mazeme: SELECT * from annotations WHERE id="+e.message);
		}
		
		var Window = require('window');
		var Button = require('button');
		var Map = require('map');
		var List = require('list');
		var Label = require('label');
		var TextField = require('textfield');
		var Image = require('image');
		var DatePicker = require('datepicker');
		var Camera = require('camera');
		var ScrollView = require('scrollview');
		
		if ($.nicknameField.getValue() != select.fieldByName('uid'))
		{
			var title = ("Displayed feature: " + select.fieldByName('id'));
			var WinEdit = new Window(title);
		}
		else {
			var title = ("Editing feature: " + select.fieldByName('id'));
			var WinEdit = new Window(title, false, true, function(evt){
				if (evt.source.title == 'Save')
				{
					currentFeatIdIn = select.fieldByName('id');
					currentGML = select.fieldByName('gmlID');
					console.log(currentFeatIdIn);
					console.log(currentGML);
					eventListSaveForm();
					WinEdit.close();
				}
				if (evt.source.title == 'Delete')
				{
					var dialog = Ti.UI.createAlertDialog({
						cancel : 1,
						buttonNames : ['Yes', 'No'],
						message : 'Delete the record?',
						title : 'Deleting ...'
					});
					dialog.addEventListener('click', function (e) {
						if (e.index === e.source.cancel) {
							Ti.API.info('The discard button was clicked');
						} else {
							currentFeatIdIn = select.fieldByName('id');
							currentGML = select.fieldByName('gmlID');
							console.log(currentFeatIdIn);
							console.log(currentGML);
							eventListMarkForDel(currentFeatIdIn);
							WinEdit.close();
							}});
					dialog.show();
				}
			});
		}
		
		WinEdit.backgroundColor='#B9E0AE';
		WinEdit.open();
		
		var scrollview = new ScrollView();
		WinEdit.add(scrollview);
		
		var left=10;
		var top= 10;
		var posun = 95;
		
		var label;
		label = new Label("Plant Name:");
		label.left=left;
		label.top=top;
		label.color='#3C4037';		
		scrollview.add(label);
		
		top+=posun;
		label = new Label("Site Configuration:");
		label.left=left;
		label.top=top;
		label.color='#3C4037';	
		scrollview.add(label);
			
		top+=posun;
		label = new Label("Photograph:");
		label.left=left;
		label.top=top;
		label.color='#3C4037';		
		scrollview.add(label);
		
		top+=posun;
		label = new Label("Observation Date:");
		label.left=left;
		label.top=top;		
		scrollview.add(label);
		
		top+=posun;
		label = new Label("Site Description:");
		label.left=left;
		label.top=top;
		label.color='#3C4037';		
		scrollview.add(label);
		
		top+=posun;
		label = new Label("Certainity:");
		label.left=left;
		label.top=top;
		label.color='#3C4037';		
		scrollview.add(label);
		
		// textfields
		top= 60;
		var textField1 = new TextField( select.fieldByName('plnt_name') );
		/*
		textField.Id='plntNameField';
		textField.addEventListener('blur',function(e){
		    var id = e.source.Id;
		});
		*/
		textField1.left=left;
		textField1.top=top;	
		scrollview.add(textField1);
		
		top+=posun;
		var textField2 = new TextField( select.fieldByName('site_conf') );
		textField2.left=left;
		textField2.top=top;	
		scrollview.add(textField2);
		
		top+=posun;
		var textField3 = new TextField( select.fieldByName('image') );
		textField3.left=left;
		textField3.top=top;	
		scrollview.add(textField3);
		
		top+=posun;
		var textField4 = new TextField( select.fieldByName('obs_date') );
		textField4.left=left;
		textField4.top=top;	
		scrollview.add(textField4);
		
		top+=posun;
		var textField5 = new TextField( select.fieldByName('site_descr') );
		textField5.left=left;
		textField5.top=top;	
		scrollview.add(textField5);
		
		top+=posun;
		var textField6 = new TextField( select.fieldByName('crtn') );
		textField6.left=left;
		textField6.top=top;	
		scrollview.add(textField6);
		
		function eventListSaveForm() {
			var db = Ti.Database.open(menoDatabazy);
			
			var sqlString = "UPDATE annotations SET plnt_name='%1', image='%2', obs_date='%3', crtn='%4', site_conf='%5', site_descr='%6', mark_for_del='0' WHERE id='" + currentFeatIdIn + "'";
			//sqlString = formatString(sqlString, [$.plntNameField.getValue(), $.imageField.getValue(), $.dateField.getValue(), $.certainityField.getValue(), $.siteConfField.getValue(), $.sdField.getValue()]);
			sqlString = formatString(sqlString, [textField1.value, textField3.value, textField4.value, textField6.value, textField2.value, textField5.value]);
		
		
			Ti.API.info(sqlString);
		
			db.execute(sqlString);
			
			// only mark for push data which is not new locally (exists on internet)
			var sqlString = "UPDATE annotations SET mark_for_push='1' WHERE id='" + currentFeatIdIn + "' AND gmlID > 0";
			db.execute(sqlString);
		
			db.close();
			buttonLocalDataFunc();

		}	
	});
});

$.tabMap.addEventListener("touchstart", function(evt){
	return false;
});

$.tabMap.addEventListener("swipe", function(evt){
	return false;
});
