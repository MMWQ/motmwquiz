create table observer_states
(
    id                serial
        constraint observer_states_pk
            primary key,
    state             varchar(100),
    capital           varchar(60),
    region            varchar(30),
    independence_year int,
    status            varchar(60)
);

create unique index observer_states_id_uindex
    on observer_states (id);
