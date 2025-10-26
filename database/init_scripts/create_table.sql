create table if not exists station (
   id                integer,
   name              varchar(100),
   locationid        int null,
   installation_date date
);

create table if not exists climameasures (
   stationname  varchar(255),
   measurevalue int null,
   unit         float null,
   currenttime  timestamp default current_timestamp
);


create table if not exists climameasures (
   stationname  varchar(255),
   measurevalue int null,
   unit         float null,
   currenttime  timestamp default current_timestamp
);