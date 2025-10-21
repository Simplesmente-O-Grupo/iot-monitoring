create table if not exists climameasures (
   stationname  varchar(255),
   measurevalue int null,
   unit         float null,
   currenttime  timestamp default current_timestamp
);