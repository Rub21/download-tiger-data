    L.mapbox.accessToken = 'pk.eyJ1IjoicnViZW4iLCJhIjoiUVFINFozRSJ9.lIZKS5xpyV57U6-_Rjr6Og';
    var map = L.mapbox.map('map', 'ruben.j0ac34if,enf.y5c4ygb9,enf.ho20a3n1,enf.game1617')
        .setView([38.89399, -77.03659], 4);

    var hash = L.hash(map);
    var featureGroup = L.featureGroup().addTo(map);
    var drawControl = new L.Control.Draw({
        draw: {
            polyline: false,
            polygon: false,
            marker: false,
            circle: false,
            rectangle: {
                shapeOptions: {
                    color: '#8FD01A'
                }
            }
        },
        edit: {
            featureGroup: featureGroup
        }
    }).addTo(map);

    map.on('draw:created', function(e) {
        featureGroup.addLayer(e.layer);
        var layer = e.layer;
        var type = e.layerType;
        layer.on('contextmenu', function(evt) {
            // download_josm_xml(get_valor(type, layer)); //working with xml
            download_file_json(get_valor(type, layer)); //working with json

        });
    });


    function get_valor(type, layer) {
        var cordenadas;
        var valor;
        if (type === 'rectangle') {
            cordenadas = layer.toGeoJSON().geometry.coordinates[0];
            var rectangle = cordenadas[0][0] + ' ' + cordenadas[0][1] + ',' + cordenadas[2][0] + ' ' + cordenadas[2][1];
            valor = rectangle.toString();
            return valor;
        }
    }

    function download_josm_xml(coordinates) {
        var url = 'http://localhost:3021/ways_xml/' + coordinates;
        var p1 = coordinates.split(",")[0].split(" ");
        var p2 = coordinates.split(",")[1].split(" ");
        $.ajax('http://localhost:8111/load_and_zoom?left=' + p1[0] + '&right=' + p2[0] + '&top=' + p2[1] + '&bottom=' + p1[1]);
        $.ajax('http://localhost:8111/import?title=tiger2013&new_layer=true&url=' + url);
    }

    function download_file_json(filename, text) {
        var url = 'http://localhost:3021/ways_json/' + coordinates;
        console.log(url);
        $.ajax({
            dataType: "json",
            url: url,
            success: function(json) {
                console.log(json);
                way_osm = osm_geojson.geojson2osm(json);
                download_osm_file('osm.osm', way_osm);
                var pom = document.createElement('a');
                var url = "data:text/plain;charset=utf-8," + encodeURIComponent(text);
                pom.setAttribute('href', url);
                console.log(download_url);
                pom.setAttribute('download', 'osm.osm');
                pom.click();
            }
        });
    }