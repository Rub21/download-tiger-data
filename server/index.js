var express = require('express');
var cors = require('cors');
var pg = require('pg');
var osm_geojson = require('../osm2geojson.js');

var conString = "postgres://postgres:1234@192.168.1.20/dbtiger";
var client = new pg.Client(conString);
var app = express();
app.use(cors());

client.connect(function(err) {
	if (err) {
		return console.error('could not connect to postgres', err);
	}
});

app.get('/ways_json/:bbox', function(req, res) {
	var bbox = req.params.bbox;
	var json = {
		"type": "FeatureCollection",
		"features": []
	};
	var query_id = "select get_geoid('" + bbox + "') as geoid;";
	client.query(query_id, function(error, result) {
		if (error) {
			console.log(error);
			res.statusCode = 404;
			return res.send('Error 404: No quote found');
		} else {
			try {
				var geoid = result.rows[0].geoid;
				console.log('=' + geoid);
				bbox = bbox.replace(' ', ',').replace(' ', ',');
				var query = "SELECT  fullname, ST_AsGeoJSON(geom) as geometry FROM tl_2013_" + geoid + "_roads WHERE   st_within(tl_2013_" + geoid + "_roads.geom ,ST_MakeEnvelope(" + bbox + ", 4326))"
				client.query(query, function(error, result) {
					if (error) {
						console.log(error);
						res.statusCode = 404;
						return res.send('Error 404: No quote found');
					} else {

						try {
							for (var i = 0; i < result.rows.length; i++) {
								var way = {
									"type": "Feature",
									"properties": {
										"highway": "residential"
									},
									"geometry": {}
								}
								if (result.rows[i].fullname !== null) {
									way.properties['name'] = rename_road(result.rows[i].fullname);

								}
								way.geometry = JSON.parse(result.rows[i].geometry);
								json.features.push(way);

							};
							res.json(json);
						} catch (e) {
							console.log("entering catch block");

						}
					}
				});

			} catch (e) {
				console.log("entering catch block");

			}
		}
	});
});

app.get('/ways_xml/:bbox', function(req, res) {
	var bbox = req.params.bbox;
	var json = {
		"type": "FeatureCollection",
		"features": []
	};
	var query_id = "select get_geoid('" + bbox + "') as geoid;";

	client.query(query_id, function(error, result) {
		if (error) {
			console.log(error);
			res.statusCode = 404;
			return res.send('Error 404: No quote found');
		} else {
			try {
				var geoid = result.rows[0].geoid;
				console.log(geoid);
				bbox = bbox.replace(' ', ',').replace(' ', ',');
				//var query = "SELECT  fullname, ST_AsGeoJSON(ST_Simplify(geom,0.00001)) as geometry FROM tl_2013_" + geoid + "_roads WHERE   st_within(tl_2013_" + geoid + "_roads.geom ,ST_MakeEnvelope(" + bbox + ", 4326))"
				//var query = "SELECT  fullname, ST_AsGeoJSON(geom) as geometry FROM tl_2013_" + geoid + "_roads WHERE   st_within(tl_2013_" + geoid + "_roads.geom ,ST_MakeEnvelope(" + bbox + ", 4326))"
				var query = "select   fullname, ST_AsGeoJSON(geom) as geometry  from temp_table;";
				console.log(query);
				client.query(query, function(error, result) {
					if (error) {
						console.log(error);
						res.statusCode = 404;
						return res.send('Error 404: No quote found');
					} else {
						try {
							for (var i = 0; i < result.rows.length; i++) {
								var way = {
									"type": "Feature",
									"properties": {
										"highway": "residential"
									},
									"geometry": {}
								}
								if (result.rows[i].fullname !== null) {
									way.properties['name'] = rename_road(result.rows[i].fullname);

								}
								way.geometry = JSON.parse(result.rows[i].geometry);
								json.features.push(way);

							};

							var osm = osm_geojson.geojson2osm(json);
							res.set('Content-Type', 'text/xml');
							res.send(osm);



						} catch (e) {
							console.log("entering catch block2");
						}
					}
				});
			} catch (e) {
				console.log(e);
				console.log("entering catch block1");

			}
		}
	});
});


app.listen(process.env.PORT || 3021);

function rename_road(road_name) {
	road_types = {
		"aly": "Alley",
		"arc": "Arcade",
		"ave": "Avenue",
		"blf": "Bluff",
		"blvd": "Boulevard",
		"byp": "Bypass",
		"cir": "Circle",
		"cres": "Crescent",
		"cswy": "Causeway",
		"ct": "Court",
		"ctr": "Center",
		"cv": "Cove",
		"dr": "Drive",
		"expy": "Expressway",
		"expwy": "Expressway",
		"fmrd": "Farm to Market Road",
		"fwy": "Freeway",
		"grd": "Grade",
		"hbr": "Harbor",
		"holw": "Hollow",
		"hwy": "Highway",
		"ln": "Lane",
		"lndg": "Landing",
		"mal": "Mall",
		"mtwy": "Motorway",
		"ovps": "Overpass",
		"pky": "Parkway",
		"pkwy": "Parkway",
		"pl": "Place",
		"plz": "Plaza",
		"rd": "Road",
		"rdg": "Ridge",
		"rmrd": "Ranch to Market Road",
		"rte": "Route",
		"skwy": "Skyway",
		"sq": "Square",
		"st": "Street",
		"ter": "Terrace",
		"tfwy": "Trafficway",
		"thfr": "Thoroughfare",
		"thwy": "Thruway",
		"tpke": "Turnpike",
		"trce": "Trace",
		"trl": "Trail",
		"tunl": "Tunnel",
		"unp": "Underpass",
		"wkwy": "Walkway",
		"xing": "Crossing",
		"pt": "Point",
		"hts": "Heights",
		"vw": "View",
		"av": "Avenue",
		"byu": "Bayoo",
		"bch": "Beach",
		"br": "Branch",
		"brg": "Bridge",
		"cll": "Calle",
		"mtn": "Mountain",
		"exd": "Extension",
		"jr": "Junior",
		"rr": "Senior",
		"lt": "Lieutenant",
		"pvt": "Private",
		"mt": "Mount",
		"sgt": "Sergeant",
		"ind": "Industrial",
		"grn": "Green",
		"lk": "Lake",
		"btm": "Bottom",
		"brk": "Brook",
		"brks": "Brooks",
		"bg": "Burg",
		"bgs": "Burgs",
		"cp": "Camp",
		"cyn": "Canyon",
		"cpe": "Cape",
		"cirs": "Circles",
		"clf": "Cliff",
		"clfs": "Cliffs",
		"clb": "Club",
		"cts": "Courts",
		"cmn": "Common",
		"cor": "Corner",
		"cors": "Lake",
		"ctrs": "Centers",
		"crse": "Course",
		"crst": "Crest",
		"curv": "Curve",
		"ext": "Extension",
		"crk": "Creek",
		"dl": "Dale",
		"dm": "Dam",
		"dv": "Divide",
		"drs": "Drives",
		"est": "Estate",
		"ests": "Estates",
		"exts": "Extensions",
		"fls": "Falls",
		"fry": "Ferry",
		"fld": "Field",
		"flds": "Fields",
		"flt": "Flat",
		"flts": "Flats",
		"frd": "Ford",
		"frst": "Forest",
		"frg": "Forge",
		"frgs": "Forges",
		"frk": "Fork",
		"ft": "Fort",
		"hbrs": "Harbors",
		"hvn": "Haven",
		"hl": "Hill",
		"hls": "Hills",
		"i": "Interstate",
		"is": "Island",
		"iss": "Islands",
		"jct": "Junction",
		"jcts": "Junctions",
		"ky": "Key",
		"kys": "Keys",
		"knl": "Knoll",
		"knls": "Knolls",
		"lks": "Lakes",
		"lgt": "Light",
		"lgts": "Lights",
		"lf": "Loaf",
		"lck": "Lock",
		"lcks": "Locks",
		"ldg": "Lodge",
		"mnr": "Manor",
		"mnrs": "Manors",
		"mdw": "Meadow",
		"mdws": "Meadows",
		"ml": "Mill",
		"msn": "Mission",
		"mhd": "Moorhead",
		"nck": "Neck",
		"orch": "Orchard",
		"psge": "Passage",
		"pln": "Plain",
		"plns": "Plains",
		"pts": "Points",
		"prt": "Port",
		"prts": "Ports",
		"pr": "Prairie",
		"radl": "Radial",
		"rnch": "Ranch",
		"rpd": "Rapid",
		"rpds": "Rapids",
		"rst": "Rest",
		"rdgs": "Ridges",
		"riv": "River",
		"rds": "Roads",
		"sky": "Skyway",
		"shl": "Shoal",
		"shls": "Shoals",
		"shr": "Shore",
		"shrs": "Shores",
		"spgs": "Springs",
		"spg": "Spring",
		"sqs": "Squares",
		"sta": "Station",
		"strm": "Stream",
		"sts": "Streets",
		"smt": "Summit",
		"un": "Union",
		"uns": "Unions",
		"vly": "Valley",
		"vlys": "Valleys",
		"via": "Viaduct",
		"vws": "Views",
		"vlg": "Village",
		"vlgs": "Villages",
		"vl": "Ville",
		"vis": "Vista",
		"wlky": "Walkway",
		//NOT EXPANDED
		"way": "Way",
		"walk": "Walk",
		"loop": "Loop",
		"oval": "Oval",
		"ramp": "Ramp",
		"row": "Row",
		"run": "Run",
		"pass": "Pass",
		"spur": "Spur",
		"path": "Path",
		"pike": "Pike",
		"rue": "Rue",
		"mall": "Mall",
		//Directions
		"n": "North",
		"s": "South",
		"e": "East",
		"w": "West",
		"ne": "Northeast",
		"nw": "Northwest",
		"se": "Southeast",
		"sw": "Southwest"
	};

	var direction = {
		//Directions
		"n": "North",
		"s": "South",
		"e": "East",
		"w": "West",
		"ne": "Northeast",
		"nw": "Northwest",
		"se": "Southeast",
		"sw": "Southwest"

	};

	var words = road_name.split(" ");
	if (words.length < 2) return road_name;
	var word_end = words[words.length - 1].toLowerCase();
	var newname = "";
	var word_start = words[0].toLowerCase();

	for (var w = 0; w < words.length - 1; w++) {
		if (w === 0 && word_start.length < 3 && direction[word_start] !== undefined) {
			newname += direction[word_start];
			newname += " ";
		} else {
			newname += words[w];
			newname += " ";
		}
	}

	//if the last word is number like: NW 0141
	if (!isNaN(word_end) && direction[word_start] !== undefined) {
		newname += word_end;
		console.log('# ' + road_name + ' --> ' + newname);
		return newname;
	}
	//for name as :  SW Dickens Rd ,NE Pr 1030 B 
	if (direction[word_start] !== undefined) {
		newname += road_types[word_end];
		console.log('# ' + road_name + ' --> ' + newname);
		return newname;
	}

	if (road_types[word_end] === undefined) {
		console.log('# ' + road_name + ' --> ' + road_name);
		return road_name;
	}

	newname += road_types[word_end];
	console.log('# ' + road_name + ' --> ' + newname);
	return newname;

}