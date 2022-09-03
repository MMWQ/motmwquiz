create table un_territory
(
    id        serial
        constraint un_territory_pk
            primary key,
    territory varchar(60),
    region    varchar(60),
    status    varchar(30)
);

create unique index un_territory_id_uindex
    on un_territory (id);
