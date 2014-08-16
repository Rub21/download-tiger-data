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
        featureGroup.addLayer(layer);
        layer.on('contextmenu', function(evt) {
            context_menu(evt, e);
            // download_josm_xml(get_valor(type, layer)); //working with xml
            // download_file_json(get_valor(type, layer)); //working with json
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
        var url = 'http://' + host + ':3021/ways_xml/' + coordinates;
        console.log(url);
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

    function context_menu(evt, e) {
        $('#context').show();
        $('#context').css('left', evt.originalEvent.clientX);
        $('#context').css('top', evt.originalEvent.clientY);
        $('#context').hover(function() {
            $('#context').show();
        });
        $('#context').mouseleave(function() {
            $('#context').hide();
        });
        var coords = get_valor(e.layerType, e.layer);
        $("#btndownload").attr('onclick', 'download_josm_xml(\'' + coords + '\')');
    }