--Funciones que verifica si un way se repide o no.
   CREATE OR REPLACE FUNCTION is_overlapping(_geom geometry, _fullname varchar(100), _coordinates varchar(250),_id_table varchar(5)) RETURNS Geometry AS
   $BODY$
   DECLARE 
	a record;
   BEGIN
	FOR a IN EXECUTE 'SELECT  * FROM tl_2013_'||_id_table||'_roads WHERE   st_within(tl_2013_'||_id_table||'_roads.geom ,ST_MakeEnvelope('||_coordinates||', 4326));'
		LOOP		
			IF ST_Equals(_geom, a.geom)  AND _fullname=a.fullname 
			THEN
				RETURN NULL;  
			ELSE
				RETURN _geom ;
			END IF;
        END LOOP;   
   END
   $BODY$
   LANGUAGE 'plpgsql';
--Funcion para optener los datos
   CREATE OR REPLACE FUNCTION get_data(_coordinates varchar(250),_id_table varchar(5) )  RETURNS SETOF tl_2013_45013_roads AS
   $BODY$
   DECLARE 
	a record;
   BEGIN
   
	FOR a IN EXECUTE 'SELECT  * FROM tl_2013_'||_id_table||'_roads WHERE   st_within(tl_2013_'||_id_table||'_roads.geom ,ST_MakeEnvelope('||_coordinates||', 4326));'
		LOOP
			a.geom = is_overlapping(a.geom, a.fullname , _coordinates,_id_table);
			IF a.geom IS NOT NULL
			THEN
				RETURN NEXT a;
			END IF;
		END LOOP;         
        RETURN;   
   END
   $BODY$
   LANGUAGE 'plpgsql';
   
select fullname, ST_AsGeoJSON(geom) FROM  get_data('-81.62992000579834,39.25781137991596,-81.62306427955627,39.263568176020584','54107');
SELECT  fullname, ST_AsGeoJSON(geom) as geometry FROM tl_2013_54107_roads WHERE   st_within(tl_2013_54107_roads.geom ,ST_MakeEnvelope(-81.62992000579834,39.25781137991596,-81.62306427955627,39.263568176020584, 4326));
