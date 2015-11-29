drop table if exists clients;

create table clients
(
	id integer auto_increment not null,
	service text not null,
	token text not null,
	kpTrigger integer not null,
	primary key (id)
);