create table un_member_states
(
    id                serial
        constraint un_member_states_pk
            primary key,
    state             varchar(100),
    capital           varchar(60),
    region            varchar(30),
    independence_year int,
    independence_from varchar(60)
);

create unique index un_member_states_id_uindex
    on un_member_states (id);
