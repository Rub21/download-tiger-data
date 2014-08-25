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





   

postgres=# CREATE FUNCTION "extract_title" (integer) RETURNS text AS '
postgres'#   DECLARE
postgres'#     sub_id ALIAS FOR $1;
postgres'#     text_output TEXT :='''';
postgres'#     row_data RECORD;
postgres'#   BEGIN
postgres'#     FOR row_data IN SELECT * FROM books
postgres'#     WHERE subject_id = sub_id ORDER BY title  LOOP
postgres'#       text_output := row_data.title;
postgres'#     END LOOP;
postgres'#     RETURN text_output;
postgres'#   END;
postgres'# ' LANGUAGE 'plpgsql';

















































































-------------------------------------------------------------------------------------------------------------------------------




CREATE OR REPLACE FUNCTION join_geom(_geom geometry, _name varchar(250),_git int)
RETURNS  int
AS $$
DECLARE b record;
	BEGIN
		FOR b IN select * from temp_table
			LOOP
            			IF st_touches(_geom,b.geom) AND (st_startpoint(_geom)=st_endpoint(b.geom)  or st_startpoint(b.geom)=st_endpoint(_geom))   AND _name=b.fullname AND ST_Contains(_geom,b.geom)
				THEN
					_geom = st_linemerge(st_union(_geom,b.geom));

					UPDATE temp_table SET geom = _geom WHERE gid = _git;
					
					DELETE FROM films USING producers  WHERE producer_id = producers.id AND producers.name = 'foo';
					return 1;
						
				END IF;			 
                          
		END LOOP;
		return 0;
	END;
$$ LANGUAGE plpgsql;


select * from temp_table


















 
   CREATE OR REPLACE FUNCTION joinnameways2()
     RETURNS SETOF tl_2013_45013_roads AS
   $BODY$
    DECLARE a tl_2013_45013_roads%rowtype;
   --DECLARE a record;
   DECLARE b record;
   DECLARE c integer;    
   BEGIN
	--tabla temporal:
	--DROP TABLE IF EXISTS temp_table CASCADE;
	--CREATE TEMP TABLE temp_table AS select * from tl_2013_45013_roads WHERE  st_within(tl_2013_45013_roads.geom ,ST_MakeEnvelope(-80.71414947509766,32.222676732232976,-80.69324970245361,32.24848636052752, 4326)) order by st_length(geom) DESC;
	
	FOR a IN EXECUTE 'select * from temp_table'  
		LOOP
			RAISE NOTICE 'PK is --%',a.fullname;
			
			FOR b IN select * from temp_table
			LOOP
            				IF st_touches(a.geom,b.geom) AND (st_startpoint(a.geom)=st_endpoint(b.geom)  or st_startpoint(b.geom)=st_endpoint(a.geom))   AND a.fullname=b.fullname 
					THEN
						a.geom = st_linemerge(st_union(a.geom,b.geom));
						
						EXECUTE 'delete from temp_table where gid=$1' USING b.gid;
					END IF;
			 
                          
			END LOOP;
		EXECUTE 'delete from temp_table where temp_table.gid=$1' USING a.gid;
		RETURN NEXT a;
			                         
         END LOOP;

        
      RETURN;
   END
   $BODY$
  LANGUAGE 'plpgsql';









CREATE OR REPLACE FUNCTION start_join2()
RETURNS  int
AS $$
DECLARE b record;
	num integer :=0;
	BEGIN
		DROP TABLE IF EXISTS temp_table2 CASCADE;
		CREATE TEMP TABLE temp_table2 AS select * from tl_2013_45013_roads WHERE  st_within(tl_2013_45013_roads.geom ,ST_MakeEnvelope(-80.71414947509766,32.222676732232976,-80.69324970245361,32.24848636052752, 4326)) order by st_length(geom) DESC;
		
		FOR b IN select * from temp_table2
			LOOP
				num=(select join_geom(b.geom,b.fullname,b.gid));                          
		END LOOP;
	return num;
	END;
$$ LANGUAGE plpgsql;


select start_join2();

select   fullname, ST_AsGeoJSON(geom) as geometry  from temp_table;




-----------------------------------------------------------------------------------
 CREATE OR REPLACE FUNCTION joinnameways()
  RETURNS SETOF tl_2013_45013_roads AS
   $BODY$
   DECLARE a record;
   DECLARE b record;
   DECLARE c integer;    
   BEGIN
      FOR a IN EXECUTE 'select * from tl_2013_45013_roads WHERE  st_within(tl_2013_45013_roads.geom ,ST_MakeEnvelope(-80.71414947509766,32.222676732232976,-80.69324970245361,32.24848636052752, 4326)) order by st_length(geom) DESC;'  
         LOOP
           FOR b IN select * from tl_2013_45013_roads WHERE  st_within(tl_2013_45013_roads.geom ,ST_MakeEnvelope(-80.71414947509766,32.222676732232976,-80.69324970245361,32.24848636052752, 4326)) order by st_length(geom) DESC
            LOOP
               IF st_touches(a.geom,b.geom) AND (st_startpoint(a.geom)=st_endpoint(b.geom)  or st_startpoint(b.geom)=st_endpoint(a.geom))   AND a.fullname=b.fullname 
               THEN
               
                  a.geom = st_linemerge(st_union(a.geom,b.geom));                  
                  RAISE NOTICE 'PK B --%',b.fullname; 
                  
               END IF;                           
            END LOOP;
            RAISE NOTICE 'PK A------------------------------------- --%',a.fullname;
            RETURN NEXT a; 
            EXIT;
         END LOOP;
      RETURN;
      
   END
   $BODY$
  LANGUAGE 'plpgsql';

  select fullname, ST_AsGeoJSON(geom) as geometry from  joinnameways()






select fullname , st_touches(geom) from tl_2013_45013_roads WHERE  st_within(tl_2013_45013_roads.geom ,ST_MakeEnvelope(-80.71414947509766,32.222676732232976,-80.69324970245361,32.24848636052752, 4326)) group by fullname


;