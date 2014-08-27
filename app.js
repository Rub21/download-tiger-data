    L.mapbox.accessToken = 'pk.eyJ1IjoicnViZW4iLCJhIjoiUVFINFozRSJ9.lIZKS5xpyV57U6-_Rjr6Og';
    var map = L.mapbox.map('map', 'ruben.j0ac34if,enf.y5c4ygb9,enf.ho20a3n1,enf.game1617')
        .setView([38.89399, -77.03659], 4);
    var host = '54.234.212.165';

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
        var layer = e.layer;
        if (polygonArea(layer.getLatLngs()) > 20) {
            alert("Select areas smaller than 20 square miles");
        } else {
            featureGroup.addLayer(layer);
            var coords = get_valor(e.layerType, e.layer);
            var btn = '<button class = "btn btn-default btn-lg" onclick="download_josm_xml(\'' + coords.toString() + '\')">Download Data</button>';
            layer.bindPopup(btn);
            layer.openPopup();
            var coor1 = coords.split(',')[0].split(' ');
            var coor2 = coords.split(',')[1].split(' ');
            var lng = (parseFloat(coor1[0]) + parseFloat(coor2[0])) / 2;
            var lat = (parseFloat(coor1[1]) + parseFloat(coor2[1])) / 2;
            var popup = L.popup()
                .setLatLng([lat, lng])
                .setContent(btn)
                .openOn(map);
        }
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
        var url = 'http://' + host + ':3021/ways_xml/' + coordinates;
        //console.log(url);
        var p1 = coordinates.split(",")[0].split(" ");
        var p2 = coordinates.split(",")[1].split(" ");
        $.ajax('http://localhost:8111/load_and_zoom?left=' + p1[0] + '&right=' + p2[0] + '&top=' + p2[1] + '&bottom=' + p1[1]);
        $.ajax('http://localhost:8111/import?title=tiger2013&new_layer=true&url=' + url);
    }

    function download_file_json(coordinates) {
        var url = 'http://' + host + ':3021/ways_json/' + coordinates;
        //console.log(url);
        var p1 = coordinates.split(",")[0].split(" ");
        var p2 = coordinates.split(",")[1].split(" ");
        $.ajax('http://localhost:8111/load_and_zoom?left=' + p1[0] + '&right=' + p2[0] + '&top=' + p2[1] + '&bottom=' + p1[1]);
        $.ajax({
            dataType: "json",
            url: url,
            success: function(json) {
                way_osm = osm_geojson.geojson2osm(json);
                var pom = document.createElement('a');
                var url_data = "data:text/plain;charset=utf-8," + encodeURIComponent(way_osm);
                pom.setAttribute('href', url_data);
                pom.setAttribute('download', 'osm.osm');
                pom.click();
            }
        });
    }

    function polygonArea(coords) {
        numPoints = coords.length;
        X = [];
        Y = [];
        for (var i = 0; i < coords.length; i++) {
            X.push(coords[i].lat);
            Y.push(coords[i].lng);
        };
        area = 0;
        j = numPoints - 1;
        for (i = 0; i < numPoints; i++) {
            area = area + (X[j] + X[i]) * (Y[j] - Y[i]);
            j = i;
        }
        area = (Math.abs(area) / 2) * 10000;
        return area;
    }