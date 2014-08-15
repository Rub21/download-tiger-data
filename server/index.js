var express = require('express');
var cors = require('cors');
var pg = require('pg');
var osm_geojson = require('../osm2geojson.js');

var conString = "postgres://postgres:1234@54.234.212.165/dbtiger";
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
	//console.log(query_id);
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
				var query = "SELECT  fullname, ST_AsGeoJSON(geom) as geometry FROM tl_2013_" + geoid + "_roads WHERE   st_within(tl_2013_" + geoid + "_roads.geom ,ST_MakeEnvelope(" + bbox + ", 4326))"
					//console.log(query);
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

								//console.log(result.rows[i].fullname);

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
				var query = "SELECT  fullname, ST_AsGeoJSON(geom) as geometry FROM tl_2013_" + geoid + "_roads WHERE   st_within(tl_2013_" + geoid + "_roads.geom ,ST_MakeEnvelope(" + bbox + ", 4326))"
					//console.log(query);
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
							//console.log(json);
							var osm = osm_geojson.geojson2osm(json);
							//console.log(osm);
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
		"br": "Bridge",
		"brg": "Bridge",
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
		"loop": "Loop",
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
	var word = words[words.length - 1].toLowerCase();
	var newname = "";
	for (var w = 0; w < words.length - 1; w++) {
		newname += words[w];
		newname += " ";
	}
	if (road_types[word] === undefined) return road_name;

	newname += road_types[word];
	console.log('# ' + road_name + ' --> ' + newname);
	return newname;
}