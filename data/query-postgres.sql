CREATE OR REPLACE FUNCTION get_geoid(_coordinates varchar(100)) 
RETURNS  varchar
AS $$
DECLARE	
	BEGIN
		return (select geoid from county WHERE ST_Within(ST_GeomFromText('LINESTRING('||_coordinates||')',4326),county.geom));
	END;
$$ LANGUAGE plpgsql;


SELECT  fullname, ST_AsGeoJSON(geom) FROM tl_2013_29037_roads WHERE   st_within(tl_2013_29037_roads.geom ,ST_MakeEnvelope(-94.47139263153076,38.70488643696675,-94.46366786956787,38.71032837941321, 4326))
