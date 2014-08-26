SELECT  fullname, ST_AsGeoJSON(geom) as geometry FROM tl_2013_45013_roads WHERE  st_within(tl_2013_45013_roads.geom ,ST_MakeEnvelope(-80.71414947509766,32.222676732232976,-80.69324970245361,32.24848636052752, 4326))
SELECT  * FROM tl_2013_45013_roads WHERE  st_within(tl_2013_45013_roads.geom ,ST_MakeEnvelope(-80.71414947509766,32.222676732232976,-80.69324970245361,32.24848636052752, 4326))
select * from tl_2013_45013_roads limit 10



-----------convertir Muiltilinestring to Linestring

select ST_AsGeoJSON(ST_LineMerge(geom)) from tl_2013_45013_roads limit 10

  create table mytable(gid serial NOT NULL,
  linearid character varying(22),
  fullname character varying(100),
  rttyp character varying(1),
  mtfcc character varying(5)
  )

  DROP FUNCTION joinOnegeoms()

CREATE OR REPLACE FUNCTION joinOnegeoms() RETURNS SETOF tl_2013_45013_roads AS
   $BODY$
   DECLARE 
	a record;
	b record;
	c integer;
	_count integer:=0;
   BEGIN
      drop table if exists pool;
      drop table if exists pool_test;
      create table pool_test as SELECT gid , fullname ,ST_LineMerge(geom) as geom FROM tl_2013_45013_roads limit 0;      
      create table pool as SELECT gid , fullname ,ST_LineMerge(geom) as geom FROM tl_2013_45013_roads WHERE  st_within(tl_2013_45013_roads.geom ,ST_MakeEnvelope(-80.71414947509766,32.222676732232976,-80.69324970245361,32.24848636052752, 4326));
      FOR a IN EXECUTE 'SELECT * FROM tl_2013_45013_roads WHERE  st_within(tl_2013_45013_roads.geom ,ST_MakeEnvelope(-80.71414947509766,32.222676732232976,-80.69324970245361,32.24848636052752, 4326));'
      LOOP
		

		FOR b IN SELECT *  FROM pool  order by st_length(geom) DESC
			    LOOP
	      
			      IF st_touches(a.geom,b.geom) AND (st_startpoint(a.geom)=st_endpoint(b.geom)  or st_startpoint(b.geom)=st_endpoint(a.geom)) AND a.fullname=b.fullname
			      -- IF a.fullname=a.fullname
			       THEN
				  a.geom = st_linemerge(st_union(a.geom,b.geom));
				 INSERT INTO pool_test(gid, fullname, geom) VALUES (a.gid, a.fullname, a.geom);
				 EXECUTE 'delete from pool where gid=$1' USING b.gid;
			       END IF;            
			    END LOOP;
			    --EXECUTE 'delete from pool where pool.gid=$1' USING a.gid;
         RETURN NEXT a;        
         END LOOP;         
         RETURN;      
   END
   $BODY$
   LANGUAGE 'plpgsql';



drop table onegeoms
   CREATE TABLE onegeoms as select * from joinOnegeoms();
   select *from joinOnegeoms();
   select * from pool_test
   select * from pool


SELECT gid , fullname ,ST_LineMerge(geom) as geom FROM tl_2013_45013_roads WHERE  st_within(tl_2013_45013_roads.geom ,ST_MakeEnvelope(-80.71414947509766,32.222676732232976,-80.69324970245361,32.24848636052752, 4326));






SELECT ST_Collect(GEOM) FROM GEOMTABLE GROUP BY ATTRCOLUMN





CREATE OR REPLACE FUNCTION verif_overlaping((_geom geometry, _name varchar(250),_gid int) ) RETURNS Geometry AS
   $BODY$
   DECLARE 
	a record;
	b record;
	c integer;
	_count integer:=0;
   BEGIN
            FOR a IN EXECUTE 'SELECT * FROM tl_2013_45013_roads WHERE  st_within(tl_2013_45013_roads.geom ,ST_MakeEnvelope(-80.71414947509766,32.222676732232976,-80.69324970245361,32.24848636052752, 4326));'
      LOOP
		

		FOR b IN SELECT *  FROM pool  order by st_length(geom) DESC
			    LOOP
	      
			      IF st_touches(a.geom,b.geom) AND (st_startpoint(a.geom)=st_endpoint(b.geom)  or st_startpoint(b.geom)=st_endpoint(a.geom)) AND a.fullname=b.fullname
			      -- IF a.fullname=a.fullname
			       THEN
				  a.geom = st_linemerge(st_union(a.geom,b.geom));
				 INSERT INTO pool_test(gid, fullname, geom) VALUES (a.gid, a.fullname, a.geom);
				 EXECUTE 'delete from pool where gid=$1' USING b.gid;
			       END IF;            
			    END LOOP;
			    --EXECUTE 'delete from pool where pool.gid=$1' USING a.gid;
         RETURN NEXT a;        
         END LOOP;         
         RETURN;      
   END
   $BODY$
   LANGUAGE 'plpgsql';







































































